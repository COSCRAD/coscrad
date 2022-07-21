import { InternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { Category } from '../../models/categories/entities/category.entity';
import { AggregateId } from '../../types/AggregateId';

export interface ICategoryRepository {
    fetchTree: () => Promise<(Category | InternalError)[]>;

    fetchById: (id: AggregateId) => Promise<Maybe<Category | InternalError>>;

    count: () => Promise<number>;
}
