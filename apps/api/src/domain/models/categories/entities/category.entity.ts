import { InternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasEntityIdAndLabel } from '../../../interfaces/HasEntityIdAndLabel';
import { ValidatesItsExternalState } from '../../../interfaces/ValidatesItsExternalState';
import { EntityId } from '../../../types/ResourceId';
import { InMemorySnapshot } from '../../../types/resourceTypes';
import validateEntityReferencesAgainstExternalState from '../../../utilities/validation/validateEntityReferencesAgainstExternalState';
import BaseDomainModel from '../../BaseDomainModel';
import InvalidExternalReferenceInCategoryError from '../errors/InvalidExternalReferenceInCategoryError';
import { ResourceOrNoteCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

export class Category
    extends BaseDomainModel
    implements ValidatesItsExternalState, HasEntityIdAndLabel
{
    id: EntityId;

    label: string;

    members: ResourceOrNoteCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
    childrenIDs: EntityId[];

    constructor({ id, label, members, childrenIDs }: DTO<Category>) {
        super();

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.childrenIDs = [...childrenIDs];
    }

    validateExternalState(externalState: DeepPartial<InMemorySnapshot>): Valid | InternalError {
        return validateEntityReferencesAgainstExternalState(
            externalState,
            this.members,
            (missing: ResourceOrNoteCompositeIdentifier[]) =>
                new InvalidExternalReferenceInCategoryError(this, missing)
        );
    }
}
