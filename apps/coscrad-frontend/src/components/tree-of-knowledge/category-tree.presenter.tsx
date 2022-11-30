import { CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import { FunctionalComponent } from '../../utils/types/functional-component';
import { CategorizableOfMultipleTypeContainer } from '../higher-order-components';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-resource-detail-presenter-factory';
import { createMultipleCategorizableLookupTable } from '../tags/createMultipleCategorizableLookupTable';

const wrapTree = ({
    label,
    children,
    members,
}: ICategoryTreeViewModel<CategorizableType>): JSX.Element => (
    <div>
        {
            <Accordion>
                <AccordionSummary>{label}</AccordionSummary>
                <AccordionDetails>
                    <CategorizableOfMultipleTypeContainer
                        categorizableTypeAndIds={createMultipleCategorizableLookupTable(members)}
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
