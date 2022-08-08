import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import tagValidator from '../../domainModelValidators/tagValidator';
import { isValid, Valid } from '../../domainModelValidators/Valid';
import { HasAggregateIdAndLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';
import { InMemorySnapshot } from '../../types/ResourceType';
import validateEntityReferencesAgainstExternalState from '../../utilities/validation/validateEntityReferencesAgainstExternalState';
import { Aggregate } from '../aggregate.entity';
import InvalidExternalReferenceByAggregateError from '../categories/errors/InvalidExternalReferenceInCategoryError';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';

@RegisterIndexScopedCommands([])
export class Tag extends Aggregate implements HasAggregateIdAndLabel {
    type = AggregateType.tag;

    id: AggregateId;

    label: string;

    members: CategorizableCompositeIdentifier[];

    constructor(dto: DTO<Tag>) {
        super(dto);

        const { id, label, members } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
    }

    getAvailableCommands(): string[] {
        return [];
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return tagValidator(this);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members;
    }

    // TODO Use a mixin for this
    validateExternalState(externalState: InMemorySnapshot): Valid | InternalError {
        const allErrors: InternalError[] = [];

        const duplicateIdValidationResult = super.validateExternalState(externalState);

        if (!isValid(duplicateIdValidationResult))
            allErrors.push(...duplicateIdValidationResult.innerErrors);

        const externalReferenceErrors = validateEntityReferencesAgainstExternalState(
            externalState,
            this.members,
            (missing: CategorizableCompositeIdentifier[]) =>
                new InvalidExternalReferenceByAggregateError(this, missing)
        );

        if (!isValid(externalReferenceErrors)) allErrors.push(externalReferenceErrors);

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }
}
