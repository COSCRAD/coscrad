import { InternalError } from '../../../../lib/errors/InternalError';
import { HasAggregateIdAndLabel } from '../../../interfaces/HasAggregateIdAndLabel';
import { AggregateId } from '../../../types/AggregateId';

export default class ChildCategoryDoesNotExistError extends InternalError {
    constructor(missingChildCategoryId: AggregateId, parentCategory: HasAggregateIdAndLabel) {
        const { id, label } = parentCategory;

        const msg = [
            `There is no category with id: ${missingChildCategoryId}`,
            `as referred to as a child of category: ${id} (${label})`,
        ].join(' ');

        super(msg);
    }
}
