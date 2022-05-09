import { InternalError } from '../../../../lib/errors/InternalError';
import formatArrayAsList from '../../../../view-models/presentation/shared/formatArrayAsList';
import { Category } from '../entities/category.entity';
import { ResourceOrNoteCompositeIdentifier } from '../types/ResourceOrNoteCompositeIdentifier';

export default class InvalidExternalReferenceInCategoryError extends InternalError {
    constructor(
        { id, label }: Pick<Category, 'id' | 'label'>,
        invalidReferences: ResourceOrNoteCompositeIdentifier[]
    ) {
        const msg = [
            `Category ${id} (${label})`,
            `references the following composite keys, which don't exist`,
            formatArrayAsList(invalidReferences, (ref) => JSON.stringify(ref)),
        ].join(' ');

        super(msg);
    }
}
