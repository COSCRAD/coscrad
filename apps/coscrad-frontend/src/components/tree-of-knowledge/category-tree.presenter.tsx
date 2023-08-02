import {
    AggregateCompositeIdentifier,
    AggregateType,
    CategorizableType,
    ICategoryTreeViewModel,
} from '@coscrad/api-interfaces';
import {
    ChevronRight as ChevronRightIcon,
    ExpandLess as ExpandLessIcon,
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
import { useState } from 'react';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

const wrapTree = ({
    id,
    label,
    children,
    members,
}: ICategoryTreeViewModel<CategorizableType>): JSX.Element => (
    <div
        data-testid={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
        key={buildDataAttributeForAggregateDetailComponent(AggregateType.category, id)}
    >
        <List>
            <ListItemButton sx={{ pl: 4 }}>
                {children.length > 0 && (
                    <ListItemIcon>
                        <ChevronRightIcon />
                    </ListItemIcon>
                )}

                <ListItemText primary={label} />
                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <CategorizablesOfMultipleTypeContainer
                    members={members}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                />
                {
                    // recurse on the children
                    children.map(wrapTree)
                }
            </Collapse>
        </List>
    </div>
);

type TreeNodeId = AggregateCompositeIdentifier;

type UXState = {
    openBranches: TreeNodeId[] | null;
};

/**
 * Note that this same presenter can also be used to present a sub-tree, thanks
 * to self-similarity.
 */
export const CategoryTreePresenter: FunctionalComponent<ICategoryTreeViewModel> = (
    tree: ICategoryTreeViewModel<CategorizableType>
) => {
    const [openBranchesState, setOpenBranchesState] = useState<UXState>({
        openBranches: null,
    });

    return (
        <>
            <div style={{ height: 0 }} data-testid="categoryTree">
                &nbsp;
            </div>
            <Typography variant="h2">Tree of Knowledge</Typography>
            {wrapTree(tree, openBranchesState)}
        </>
    );
};
