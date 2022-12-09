import { CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';

const wrapTree = ({
    id,
    label,
    children,
    members,
}: ICategoryTreeViewModel<CategorizableType>): JSX.Element => (
    <div data-testid={id} key={id}>
        {
            <Accordion>
                <AccordionSummary>{label}</AccordionSummary>
                <AccordionDetails>
                    <CategorizablesOfMultipleTypeContainer
                        members={members}
                        detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    />
                    {
                        // recurse on the children
                        children.map(wrapTree)
                    }
                </AccordionDetails>
            </Accordion>
        }
    </div>
);

/**
 * Note that this same presenter can also be used to present a sub-tree, thanks
 * to self-similarity.
 */
export const CategoryTreePresenter: FunctionalComponent<ICategoryTreeViewModel> = (
    tree: ICategoryTreeViewModel<CategorizableType>
) => (
    <div data-testid="categoryTree">
        <h2>Tree of Knowledge</h2>
        {wrapTree(tree)}
    </div>
);
