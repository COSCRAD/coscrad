import { Category } from '../../models/categories/entities/category.entity';
import { CategorizedTree } from '../../models/categories/types/CategorizedTree';
import { EntityId } from '../../types/ResourceId';

export interface ICategoryRepository {
    fetchTree: () => Promise<CategorizedTree>;

    fetchById: (id: EntityId) => Promise<Category>;

    count: () => Promise<number>;
}
