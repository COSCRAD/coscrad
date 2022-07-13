import { Category } from '../../../../domain/models/categories/entities/category.entity';
import { AggregateType } from '../../../../domain/types/AggregateType';
import { DTO } from '../../../../types/DTO';
import { CategoryDocument } from '../../types/CategoryDocument';
import mapEntityDTOToDatabaseDTO from '../mapEntityDTOToDatabaseDTO';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182200005]
 * Remove the `childrenIDs` prop to opt-out instead of opting-in to the other
 * properties. The current approach is not extensible.
 */
export default ({ id, label, members }: DTO<Category>): CategoryDocument =>
    mapEntityDTOToDatabaseDTO({
        id,
        label,
        members,
        type: AggregateType.category,
    });
