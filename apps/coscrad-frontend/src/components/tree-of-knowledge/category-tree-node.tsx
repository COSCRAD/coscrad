import {
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
    const [open, setOpen] = useState(false);
    const { categoryTreeNodeDepth, setCategoryTreeNodeDepth } = useContext(CategoryTreeUXContext);

    const handleClick = () => {
        const newCategoryTreeNodeDepth = categoryTreeNodeDepth + 1;
        console.log({ newCategoryTreeNodeDepth });

        setCategoryTreeNodeDepth(newCategoryTreeNodeDepth);
        console.log({ categoryTreeNodeDepth });

        setOpen(!open);
    };

    return (
        <>
            <ListItemButton sx={{ pl: 4 }} onClick={() => handleClick()}>
                {!isNullOrUndefined(children) &&
                    (open ? (
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
            <Collapse in={open} timeout="auto" unmountOnExit>
                <List sx={{ pl: 4 }} component="div" disablePadding>
                    {members.length > 0 && (
                        <Accordion>
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
