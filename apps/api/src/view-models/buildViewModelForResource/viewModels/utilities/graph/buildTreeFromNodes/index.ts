import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { ICategoryTree } from '../../../interfaces/ICategoryTree';
import findRoot from './findRoot';
import joinInTheChildren from './joinInTheChildren';

export default (allNodes: Category[]): ICategoryTree => {
    const rootNode = findRoot(allNodes);

    return joinInTheChildren(rootNode, allNodes);
};
