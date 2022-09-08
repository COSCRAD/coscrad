import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { Category } from '../entities/category.entity';

export default class ChildCategoryDoesNotExistError extends InternalError {
    constructor(missingChildCategoryId: AggregateId, parentCategory: Category) {
        const { id, label } = parentCategory;

        const msg = [
            `There is no category with id: ${missingChildCategoryId}`,
            `as referred to as a child of category: ${id} (${label})`,
        ].join(' ');

        super(msg);
    }
}
