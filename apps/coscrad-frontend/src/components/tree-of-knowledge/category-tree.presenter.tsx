import { CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { List, Typography } from '@mui/material';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CategoryTreeNode } from './category-tree-node';
import { CategoryTreeUXProvider } from './category-tree-ui-context';

const wrapTree = ({
    id,
    label,
    children,
    members,
}: ICategoryTreeViewModel<CategorizableType>): JSX.Element => {
    return (
        <CategoryTreeNode key={id} id={id} label={label} members={members} wrapTree={wrapTree}>
            {children}
        </CategoryTreeNode>
    );
};

/**
 * Note that this same presenter can also be used to present a sub-tree, thanks
 * to self-similarity.
 */
export const CategoryTreePresenter: FunctionalComponent<ICategoryTreeViewModel> = (
    tree: ICategoryTreeViewModel<CategorizableType>
) => {
    return (
        <>
            <div data-testid="categoryTree" />
            <Typography variant="h2">Tree of Knowledge</Typography>
            <CategoryTreeUXProvider>
                <List>{wrapTree(tree)}</List>
            </CategoryTreeUXProvider>
        </>
    );
};
