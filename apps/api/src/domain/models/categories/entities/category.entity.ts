import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DeepPartial } from '../../../../types/DeepPartial';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import categoryValidator from '../../../domainModelValidators/categoryValidator';
import { Valid } from '../../../domainModelValidators/Valid';
import { HasAggregateIdAndLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { ValidatesExternalState } from '../../../interfaces/ValidatesExternalState';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { InMemorySnapshot } from '../../../types/ResourceType';
import validateEntityReferencesAgainstExternalState from '../../../utilities/validation/validateEntityReferencesAgainstExternalState';
import { Aggregate } from '../../aggregate.entity';
import ChildCategoryDoesNotExistError from '../errors/ChildCategoryDoesNotExistError';
import InvalidExternalReferenceInCategoryError from '../errors/InvalidExternalReferenceInCategoryError';
import InvalidExternalStateForCategoryError from '../errors/InvalidExternalStateForCategoryError';
import { CategorizableCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

@RegisterIndexScopedCommands([])
export class Category extends Aggregate implements ValidatesExternalState, HasAggregateIdAndLabel {
    readonly type = AggregateType.category;

    readonly id: AggregateId;

    readonly label: string;

    readonly members: CategorizableCompositeIdentifier[];

    // These are `Category` IDs for the children categories of this category
    readonly childrenIDs: AggregateId[];

    constructor(dto: DTO<Category>) {
        super(dto);

        const { id, label, members, childrenIDs } = dto;

        this.id = id;

        this.label = label;

        this.members = cloneToPlainObject(members);

        this.childrenIDs = Array.isArray(childrenIDs) ? [...childrenIDs] : undefined;
    }

    getAvailableCommands(): string[] {
        return [];
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return categoryValidator(this);
    }

    validateExternalState(externalState: DeepPartial<InMemorySnapshot>): Valid | InternalError {
        const allErrors: InternalError[] = [];

        const memberReferenceValidationResult = validateEntityReferencesAgainstExternalState(
            externalState,
            this.members,
            (missing: CategorizableCompositeIdentifier[]) =>
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
