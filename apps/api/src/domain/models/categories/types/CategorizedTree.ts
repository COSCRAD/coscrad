import { DTO } from '../../../../types/DTO';
import { Category } from '../entities/category.entity';

export type CategorizedTreeNode = DTO<Category>;

export type CategorizedTree = CategorizedTreeNode[];
