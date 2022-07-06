import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import tagValidator from '../../domainModelValidators/tagValidator';
import { Valid } from '../../domainModelValidators/Valid';
import { HasAggregateIdAndLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { ValidatesExternalState } from '../../interfaces/ValidatesExternalState';
import { AggregateId } from '../../types/AggregateId';
import { InMemorySnapshot } from '../../types/ResourceType';
import validateEntityReferencesAgainstExternalState from '../../utilities/validation/validateEntityReferencesAgainstExternalState';
import { Aggregate } from '../aggregate.entity';
import InvalidExternalReferenceInCategoryError from '../categories/errors/InvalidExternalReferenceInCategoryError';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';

@RegisterIndexScopedCommands([])
export class Tag extends Aggregate implements ValidatesExternalState, HasAggregateIdAndLabel {
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

    // TODO Use a mixin for this
    validateExternalState(externalState: DeepPartial<InMemorySnapshot>): Valid | InternalError {
        return validateEntityReferencesAgainstExternalState(
            externalState,
            this.members,
            (missing: CategorizableCompositeIdentifier[]) =>
                new InvalidExternalReferenceInCategoryError(this, missing)
        );
    }
}
