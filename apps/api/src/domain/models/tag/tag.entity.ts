import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { Valid } from '../../domainModelValidators/Valid';
import { HasAggregateIdAndLabel } from '../../interfaces/HasAggregateIdAndLabel';
import { ValidatesExternalState } from '../../interfaces/ValidatesExternalState';
import { AggregateId } from '../../types/AggregateId';
import { InMemorySnapshot } from '../../types/ResourceType';
import validateEntityReferencesAgainstExternalState from '../../utilities/validation/validateEntityReferencesAgainstExternalState';
import BaseDomainModel from '../BaseDomainModel';
import InvalidExternalReferenceInCategoryError from '../categories/errors/InvalidExternalReferenceInCategoryError';
import { CategorizableCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';

export class Tag extends BaseDomainModel implements ValidatesExternalState, HasAggregateIdAndLabel {
    id: AggregateId;

    label: string;

    members: CategorizableCompositeIdentifier[];

    constructor({ id, label, members }: DTO<Tag>) {
        super();

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);
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
