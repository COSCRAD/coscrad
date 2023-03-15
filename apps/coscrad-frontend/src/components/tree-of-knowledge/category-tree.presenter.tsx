import { CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
import { CoscradMainContentContainer } from '../../utils/generic-components/style-components/coscrad-main-content-container';
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
        <Accordion>
            <AccordionSummary>{label}</AccordionSummary>
            <AccordionDetails>
                {/* TODO Pass the state in as props */}
                {/* TODO Use `SelectedCategorizablesOfMultipleTypesPresenter` as in `Notes` and `Tags` flow */}
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
    </div>
);

/**
 * Note that this same presenter can also be used to present a sub-tree, thanks
 * to self-similarity.
 */
export const CategoryTreePresenter: FunctionalComponent<ICategoryTreeViewModel> = (
    tree: ICategoryTreeViewModel<CategorizableType>
) => (
    <CoscradMainContentContainer>
        <div style={{ height: 0 }} data-testid="categoryTree">
            &nbsp;
        </div>
        <Typography variant="h2">Tree of Knowledge</Typography>
        {wrapTree(tree)}
    </CoscradMainContentContainer>
);
