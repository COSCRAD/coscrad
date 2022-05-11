import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { ICategoryTree } from '../../../interfaces/ICategoryTree';

const joinInTheChildren = (node: Category, allNodes: Category[]): ICategoryTree => ({
    id: node.id,
    label: node.label,
    members: node.members,
    // TODO [performance] Investigate efficiency (stress test?), consider optimizing
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
