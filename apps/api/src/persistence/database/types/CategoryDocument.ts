import { Category } from '../../../domain/models/categories/entities/category.entity';
import { DTO } from '../../../types/DTO';
import { ArangoDatabaseDocument } from '../utilities/mapEntityDTOToDatabaseDTO';

export type CategoryDocument = Omit<ArangoDatabaseDocument<DTO<Category>>, 'childrenIDs'>;
