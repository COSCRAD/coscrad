import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { CateogryTreeViewModel } from '../../../category-tree.view-model';

const joinInTheChildren = (node: Category, allNodes: Category[]): CateogryTreeViewModel => ({
    id: node.id,
    label: node.label,
    members: node.members,
    /**
     * TODO [https://www.pivotaltracker.com/story/show/182201457]
     * Investigate efficiency (stress test), consider optimizing
     */
    children:
        node.childrenIDs.length === 0
            ? []
            : node.childrenIDs.map((childId) =>
                  joinInTheChildren(
                      allNodes.find(({ id }) => id === childId),
                      allNodes
                  )
              ),
});

export default joinInTheChildren;
