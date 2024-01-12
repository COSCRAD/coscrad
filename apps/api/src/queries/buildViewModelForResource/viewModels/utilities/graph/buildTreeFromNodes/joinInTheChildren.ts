import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import idEquals from '../../../../../../domain/models/shared/functional/idEquals';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { CategoryTreeViewModel } from '../../../category-tree.view-model';

const joinInTheChildren = (node: Category, allNodes: Category[]): CategoryTreeViewModel => {
    const { id, label, members, childrenIDs } = node;

    return {
        id: id,
        label: label,
        members: members,
        name: buildMultilingualTextWithSingleItem(label),
        /**
         * TODO [https://www.pivotaltracker.com/story/show/182201457]
         * Investigate efficiency (stress test), consider optimizing
         */
        children:
            childrenIDs.length === 0
                ? []
                : childrenIDs.map((childId) => {
                      const childNode = allNodes.find(idEquals(childId));

                      if (!childNode) {
                          throw new InternalError(
                              `Encountered an invalid reference to a child category. There is no node with id: ${childId}`
                          );
                      }

                      return joinInTheChildren(childNode, allNodes);
                  }),
    };
};

export default joinInTheChildren;
