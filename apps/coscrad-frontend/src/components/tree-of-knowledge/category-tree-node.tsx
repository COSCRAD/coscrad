import {
    AggregateType,
    CategorizableType,
    ICategoryTreeViewModel,
    ICompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import {
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Collapse,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { useContext, useState } from 'react';
import { buildDataAttributeForAggregateDetailComponent } from '../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { CategoryTreeUXContext } from './category-tree-ui-context';

interface TreeNodeProps {
    id: string;
    label: string;
    members: ICompositeIdentifier<CategorizableType>[];
    children: ICategoryTreeViewModel<CategorizableType>[];
    wrapTree: ({
        id,
        label,
        children,
        members,
    }: ICategoryTreeViewModel<CategorizableType>) => JSX.Element;
}

export const CategoryTreeNode = ({ id, label, children, members, wrapTree }: TreeNodeProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const { categoryTreeNodeDepth, setCategoryTreeNodeDepth } = useContext(CategoryTreeUXContext);

    const handleClick = () => {
        const newCategoryTreeNodeDepth = categoryTreeNodeDepth + 1;

        setCategoryTreeNodeDepth(newCategoryTreeNodeDepth);

        setIsOpen(!isOpen);
    };

    const ExpandArrowIcon = () => (isOpen ? <ExpandMoreIcon /> : <ChevronRightIcon />);

    return (
        <>
            <ListItemButton
                data-testid={buildDataAttributeForAggregateDetailComponent(
                    AggregateType.category,
                    id
                )}
                sx={{ pl: 4 }}
                onClick={() => handleClick()}
            >
                {!isNullOrUndefined(children) && (
                    <ListItemIcon>
                        <ExpandArrowIcon />
                    </ListItemIcon>
                )}
                <ListItemText primary={label} />
            </ListItemButton>
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
                <List sx={{ pl: 4 }} component="div" disablePadding>
                    {members.length > 0 && (
                        <Accordion
                            data-testid={`resources-for-${buildDataAttributeForAggregateDetailComponent(
                                AggregateType.category,
                                id
                            )}`}
                        >
                            <AccordionSummary>Resources in this Category</AccordionSummary>
                            <AccordionDetails>
                                <CategorizablesOfMultipleTypeContainer
                                    members={members}
                                    detailPresenterFactory={
                                        thumbnailCategorizableDetailPresenterFactory
                                    }
                                />
                            </AccordionDetails>
                        </Accordion>
                    )}
                    {
                        // recurse on the children
                        children.map(wrapTree)
                    }
                </List>
            </Collapse>
        </>
    );
};