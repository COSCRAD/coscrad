import { isResourceType } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { Route } from 'react-router-dom';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { CategorizablePage } from '../components/higher-order-components/categorizable-page';
import { fullViewCategorizablePresenterFactory } from '../components/resources/factories/full-view-categorizable-presenter-factory';
import { tableViewCategorizableIndexPresenterFactory } from '../components/resources/factories/table-view-categorizable-index-presenter-factory';
import { thumbnailCategorizableDetailPresenterFactory } from '../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { ConfigurableContentContext } from '../configurable-front-matter/configurable-content-provider';
import { DetailViewType } from '../configurable-front-matter/data/configurableContentSchema';
import { routes } from './routes/routes';

export const IndexToDetailFlowRoutes = () => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    return indexToDetailFlows.map(({ categorizableType, detailViewType, indexFilter }) => {
        const routeBuilder = isResourceType(categorizableType)
            ? routes.resources.ofType(categorizableType)
            : routes.notes;

        /**
         * TODO Use a switch, lookup table, or OOP & polymorphism as soon as
         * you have a third view type.
         *
         * Note that we are making `full-view` the default here.
         */
        const detailPresenterFactory =
            detailViewType === DetailViewType.thumbnail
                ? thumbnailCategorizableDetailPresenterFactory
                : fullViewCategorizablePresenterFactory;

        return (
            <>
                <Route
                    path={routeBuilder.index}
                    element={
                        <FilteredCategorizableIndexContainer
                            IndexPresenter={tableViewCategorizableIndexPresenterFactory(
                                categorizableType
                            )}
                            preFilter={indexFilter}
                            aggregateType={categorizableType}
                        />
                    }
                />
                <Route
                    path={routeBuilder.detail()}
                    element={
                        <CategorizablePage
                            categorizableType={categorizableType}
                            detailPresenterFactory={detailPresenterFactory}
                        />
                    }
                />
            </>
        );
    });
};
