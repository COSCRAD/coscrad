import { Category } from '../../../../../../domain/models/categories/entities/category.entity';
import { InternalError } from '../../../../../../lib/errors/InternalError';

type TreeNode = {
    id: string;
    childrenIDs: string[];
};

type Tree<T extends TreeNode> = T[];

/**
 * TODO [performance] optimize this
 *
 * TODO [design] consider creating a tree data structure and making this a method there
 */
export default (tree: Tree<Category>): Category => {
    if (tree.length === 0) return undefined;

    if (tree.length === 1) return tree[0];

    const nodesWithChildren = tree.filter((node) => node.childrenIDs.length > 0);

    if (nodesWithChildren.length === 0) {
        throw new InternalError(
            `Invalid tree encountered. Cannot have multiple nodes yet no nodes with children.`
        );
    }

    const allChildrenIDs = tree.flatMap(({ childrenIDs }) => childrenIDs);

    const rootNodes = nodesWithChildren.filter(
        ({ id: parentID }) => !allChildrenIDs.some((id) => id === parentID)
    );

    if (rootNodes.length === 0) {
        throw new InternalError(`Failed to find a root node in tree: ${JSON.stringify(tree)}`);
    }

    if (rootNodes.length > 1) {
        throw new InternalError(
            `Invalid tree: ${JSON.stringify(tree)}. Found multiple root nodes: ${JSON.stringify(
                rootNodes
            )}`
        );
    }

    return rootNodes[0];
};
