import { AggregateType } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import idEquals from '../../../../../../domain/models/shared/functional/idEquals';
import { CategoryTreeViewModel } from '../../../category-tree.view-model';

const joinInTheChildren = (node: Category, allNodes: Category[]): CategoryTreeViewModel => ({
    type: AggregateType.category,
    id: node.id,
    label: node.label,
    members: node.members,
    name: buildMultilingualTextWithSingleItem(node.label),
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182201457]
     * Investigate efficiency (stress test), consider optimizing
     */
    children:
        node.childrenIDs.length === 0
            ? []
            : node.childrenIDs.map((childId) =>
                  joinInTheChildren(allNodes.find(idEquals(childId)), allNodes)
              ),
});

export default joinInTheChildren;
