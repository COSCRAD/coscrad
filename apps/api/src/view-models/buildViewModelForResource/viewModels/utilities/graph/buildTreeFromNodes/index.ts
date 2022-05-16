import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { CateogryTreeViewModel } from '../../../category-tree.view-model';
import findRoot from './findRoot';
import joinInTheChildren from './joinInTheChildren';

export default (allNodes: Category[]): CateogryTreeViewModel => {
    const rootNode = findRoot(allNodes);

    return joinInTheChildren(rootNode, allNodes);
};
