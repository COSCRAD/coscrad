import { CompositeIdentifier, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import TagLabelAlreadyInUseError from '../../domainModelValidators/errors/tag/TagLabelAlreadyInUseError';
import { isValid, Valid } from '../../domainModelValidators/Valid';
import { HasLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { CategorizableType, isCategorizableType } from '../../types/CategorizableType';
import { InMemorySnapshot } from '../../types/ResourceType';
import { Aggregate } from '../aggregate.entity';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';

@RegisterIndexScopedCommands([])
export class Tag extends Aggregate implements HasLabel {
    type = AggregateType.tag;

    id: AggregateId;

    @NonEmptyString({
        label: 'label',
        description: 'a human readable text label for this tag',
    })
    label: string;

    @CompositeIdentifier(CategorizableType, isCategorizableType, {
        isArray: true,
        label: 'members',
        description: 'the composite identifier of every resource or note with this tag',
    })
    members: CategorizableCompositeIdentifier[];

    constructor(dto: DTO<Tag>) {
        super(dto);

        if (!dto) return;

        const { id, label, members } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
    }

    relabel(newLabel: string) {
        return this.safeClone<Tag>({
            label: newLabel,
        });
    }

    getAvailableCommands(): string[] {
        return [];
    }

    validateLabelAgainstExternalState(externalState: InMemorySnapshot): ValidationResult {
        const labelCollisionErrors = externalState.tag
            .filter(({ label }) => label === this.label)
            .map(({ id, label }) => new TagLabelAlreadyInUseError(label, id));

        return labelCollisionErrors.length > 0
            ? new InvalidExternalStateError(labelCollisionErrors)
            : Valid;
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const baseValidationErrors = super.validateExternalState(externalState);

        const labelValidationResult = this.validateLabelAgainstExternalState(externalState);

        // There must be a better pattern for composing these
        const allErrors = [
            ...(isValid(baseValidationErrors) ? [] : baseValidationErrors.innerErrors),
            ...(isValid(labelValidationResult) ? [] : labelValidationResult.innerErrors),
        ];

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members;
    }
}
