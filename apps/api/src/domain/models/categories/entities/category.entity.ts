import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasEntityIdAndLabel } from '../../../interfaces/HasEntityIdAndLabel';
import { ValidatesExternalState } from '../../../interfaces/ValidatesExternalState';
import { EntityId } from '../../../types/ResourceId';
import { InMemorySnapshot } from '../../../types/resourceTypes';
import validateEntityReferencesAgainstExternalState from '../../../utilities/validation/validateEntityReferencesAgainstExternalState';
import BaseDomainModel from '../../BaseDomainModel';
import ChildCategoryDoesNotExistError from '../errors/ChildCategoryDoesNotExistError';
import InvalidExternalReferenceInCategoryError from '../errors/InvalidExternalReferenceInCategoryError';
import InvalidExternalStateForCategoryError from '../errors/InvalidExternalStateForCategoryError';
import { ResourceOrNoteCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

export class Category
    extends BaseDomainModel
    implements ValidatesExternalState, HasEntityIdAndLabel
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
        const allErrors: InternalError[] = [];

        const memberReferenceValidationResult = validateEntityReferencesAgainstExternalState(
            externalState,
            this.members,
            (missing: ResourceOrNoteCompositeIdentifier[]) =>
                new InvalidExternalReferenceInCategoryError(this, missing)
        );

        if (isInternalError(memberReferenceValidationResult))
            allErrors.push(memberReferenceValidationResult);

        const childCategoriesNotInSnapshot = this.childrenIDs.filter(
            (childId) => !externalState.categoryTree.some(({ id }) => id === childId)
        );

        if (childCategoriesNotInSnapshot.length > 0)
            childCategoriesNotInSnapshot.forEach((childId) =>
                allErrors.push(new ChildCategoryDoesNotExistError(childId, this))
            );

        if (allErrors.length > 0) return new InvalidExternalStateForCategoryError(this, allErrors);

        return Valid;
    }
}
