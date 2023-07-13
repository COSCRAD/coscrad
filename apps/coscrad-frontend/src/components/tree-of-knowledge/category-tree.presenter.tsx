import { AggregateType, CategorizableType, ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@mui/material';
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
    <>
        <div style={{ height: 0 }} data-testid="categoryTree">
            &nbsp;
        </div>
        <Typography variant="h2">Tree of Knowledge</Typography>
        {wrapTree(tree)}
    </>
);
