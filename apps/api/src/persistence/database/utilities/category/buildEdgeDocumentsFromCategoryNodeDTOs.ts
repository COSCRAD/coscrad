import { Category } from '../../../../domain/models/categories/entities/category.entity';
import { ArangoDatabaseDocument } from '../mapEntityDTOToDatabaseDocument';
import buildCategoryDocHandle from './../buildCategoryDocHandle';

export default (categoryNodes: Category[]): ArangoDatabaseDocument<Category>[] =>
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
