import { CategoryDocument } from '../../types/CategoryDocument';
import { HasArangoDocumentDirectionAttributes } from '../../types/HasArangoDocumentDirectionAttributes';
import mapDatabaseDTOToEntityDTO from '../mapDatabaseDTOToEntityDTO';
import buildLookupTableForChildrenIDs from './buildLookupTableForChildrenIDs';

export default (categories: CategoryDocument[], edges: HasArangoDocumentDirectionAttributes[]) => {
    const lookupTable = buildLookupTableForChildrenIDs(edges);

    return categories
        .map((categoryDoc) => ({
            ...categoryDoc,
            childrenIDs: lookupTable.has(categoryDoc._key) ? lookupTable.get(categoryDoc._key) : [],
        }))
        .map(mapDatabaseDTOToEntityDTO);
};
