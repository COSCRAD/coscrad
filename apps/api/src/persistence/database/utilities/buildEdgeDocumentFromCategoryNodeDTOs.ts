import { Category } from '../../../domain/models/categories/entities/category.entity';
import { CategorizedTree } from '../../../domain/models/categories/types/CategorizedTree';
import { EntityId } from '../../../domain/models/types/EntityId';
import { categoryCollectionID } from '../types/ArangoCollectionId';
import { ArangoDocumentHandle } from '../types/ArangoDocumentHandle';
import { DatabaseDocument } from './mapEntityDTOToDatabaseDTO';

const buildCategoryDocHandle = (id: EntityId): ArangoDocumentHandle =>
    `${categoryCollectionID}/${id}`;

export default (categoryNodes: CategorizedTree): DatabaseDocument<Category>[] =>
    categoryNodes.reduce(
        (acc, { childrenIDs, id: parentId }) =>
            childrenIDs.length === 0
                ? acc
                : acc.concat(
                      childrenIDs.map((childId) => ({
                          _to: buildCategoryDocHandle(childId),
                          _from: buildCategoryDocHandle(parentId),
                      }))
                  ),
        []
    );
