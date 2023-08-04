import { AggregateType, CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { List, Typography } from '@mui/material';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
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
        <div
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
            key={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
        >
            <CategoryTreeNode id={id} label={label} members={members} wrapTree={wrapTree}>
                {children}
            </CategoryTreeNode>
        </div>
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
            <div style={{ height: 0 }} data-testid="categoryTree">
                &nbsp;
            </div>
            <Typography variant="h2">Tree of Knowledge</Typography>
            <CategoryTreeUXProvider>
                <List>{wrapTree(tree)}</List>
            </CategoryTreeUXProvider>
        </>
    );
};
