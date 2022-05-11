import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { Category } from '../../models/categories/entities/category.entity';
import { EntityId } from '../../types/ResourceId';

export interface ICategoryRepository {
    fetchTree: () => Promise<(Category | InternalError)[]>;

    fetchById: (id: EntityId) => Promise<Maybe<Category | InternalError>>;

    count: () => Promise<number>;
}
