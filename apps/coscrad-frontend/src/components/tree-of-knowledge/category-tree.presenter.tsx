import { AggregateType, CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import {
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
} from '@mui/material';
import { useContext, useState } from 'react';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import {
    CategoryTreeUXState,
    CategoryTreeUXStateContext,
    TreeNodeId,
    UpdateCategoryTreeUXState,
} from './category-tree-context-provider';

const isBranchOpen = (treeNodeId: TreeNodeId, { openBranches }: CategoryTreeUXState) =>
    openBranches.includes(treeNodeId);

const WrapTree: FunctionalComponent<ICategoryTreeViewModel<CategorizableType>> = ({
    id,
    label,
    children,
    members,
}) => {
    const { categoryTreeUXState, setCategoryTreeUXState } = useContext<UpdateCategoryTreeUXState>(
        CategoryTreeUXStateContext
    );

    const handleClick = (id) => {
        const isTreeNodeOpen = categoryTreeUXState.openBranches.includes(id);

        if (isTreeNodeOpen) {
            const arrayWithoutId = categoryTreeUXState.openBranches.filter((openBranchId) => {
                return openBranchId !== id;
            });

            setCategoryTreeUXState({
                openBranches: arrayWithoutId,
            });
        } else {
            const arrayWithId = [...categoryTreeUXState.openBranches, id];

            setCategoryTreeUXState({
                openBranches: arrayWithId,
            });
        }
    };

    return (
        <div
            data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
            key={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
        >
            <List>
                <ListItemButton sx={{ pl: 4 }} onClick={() => handleClick(id)}>
                    {children.length > 0 &&
                        (isBranchOpen(id, categoryTreeUXState) ? (
                            <ListItemIcon>
                                <ExpandMoreIcon />
                            </ListItemIcon>
                        ) : (
                            <ListItemIcon>
                                <ChevronRightIcon />
                            </ListItemIcon>
                        ))}

                    <ListItemText primary={label} />
                </ListItemButton>
                <Collapse in={isBranchOpen(id, categoryTreeUXState)} timeout="auto" unmountOnExit>
                    <CategorizablesOfMultipleTypeContainer
                        members={members}
                        detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    />
                    {
                        // recurse on the children
                        children.map(WrapTree)
                    }
                </Collapse>
            </List>
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
    const [categoryTreeUXState, setCategoryTreeUXState] = useState<CategoryTreeUXState>({
        openBranches: [],
    });

    const value = { categoryTreeUXState, setCategoryTreeUXState };

    return (
        <CategoryTreeUXStateContext.Provider value={value}>
            <div style={{ height: 0 }} data-testid="categoryTree">
                &nbsp;
            </div>
            <Typography variant="h2">Tree of Knowledge</Typography>
            {WrapTree(tree)}
        </CategoryTreeUXStateContext.Provider>
    );
};
