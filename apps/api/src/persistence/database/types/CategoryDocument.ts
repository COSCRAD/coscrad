import { Category } from '../../../domain/models/categories/entities/category.entity';
import { DTO } from '../../../types/DTO';
import { DatabaseDocument } from '../utilities/mapEntityDTOToDatabaseDTO';

export type CategoryDocument = Omit<DatabaseDocument<DTO<Category>>, 'childrenIDs'>;
