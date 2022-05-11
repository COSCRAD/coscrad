import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { Valid } from '../../domainModelValidators/Valid';
import { HasEntityIdAndLabel } from '../../interfaces/HasEntityIdAndLabel';
import { ValidatesExternalState } from '../../interfaces/ValidatesExternalState';
import { EntityId } from '../../types/ResourceId';
import { InMemorySnapshot } from '../../types/resourceTypes';
import validateEntityReferencesAgainstExternalState from '../../utilities/validation/validateEntityReferencesAgainstExternalState';
import BaseDomainModel from '../BaseDomainModel';
import InvalidExternalReferenceInCategoryError from '../categories/errors/InvalidExternalReferenceInCategoryError';
import { ResourceOrNoteCompositeIdentifier } from '../categories/types/ResourceOrNoteCompositeIdentifier';

export class Tag extends BaseDomainModel implements ValidatesExternalState, HasEntityIdAndLabel {
    id: EntityId;

    label: string;

    members: ResourceOrNoteCompositeIdentifier[];

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
            (missing: ResourceOrNoteCompositeIdentifier[]) =>
                new InvalidExternalReferenceInCategoryError(this, missing)
        );
    }
}
