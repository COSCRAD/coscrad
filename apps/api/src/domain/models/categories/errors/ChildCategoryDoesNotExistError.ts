import { InternalError } from '../../../../lib/errors/InternalError';
import { HasEntityIdAndLabel } from '../../../interfaces/HasEntityIdAndLabel';
import { EntityId } from '../../../types/ResourceId';

export default class ChildCategoryDoesNotExistError extends InternalError {
    constructor(missingChildCategoryId: EntityId, parentCategory: HasEntityIdAndLabel) {
        const { id, label } = parentCategory;

        const msg = [
            `There is no category with id: ${missingChildCategoryId}`,
            `as referred to as a child of category: ${id} (${label})`,
        ].join(' ');

        super(msg);
    }
}
