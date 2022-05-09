import { DTO } from '../../../../types/DTO';
import { EntityId } from '../../../types/ResourceId';
import { Category } from '../entities/category.entity';

export type CategorizedTreeNode = DTO<Category> & {
    // This refers to other `CategorizedTreeNodes` in the same tree
    children: EntityId[];
};

export type CategorizedTree = CategorizedTreeNode[];
