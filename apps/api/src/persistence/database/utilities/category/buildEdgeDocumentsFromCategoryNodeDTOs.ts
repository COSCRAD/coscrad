import { Category } from '../../../../domain/models/categories/entities/category.entity';
import buildCategoryDocHandle from './../buildCategoryDocHandle';
import { DatabaseDocument } from './../mapEntityDTOToDatabaseDTO';

export default (categoryNodes: Category[]): DatabaseDocument<Category>[] =>
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
