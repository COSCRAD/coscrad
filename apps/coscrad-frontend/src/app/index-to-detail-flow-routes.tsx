import { useContext } from 'react';
import { Route } from 'react-router-dom';
import { isResourceType } from '../../../../libs/api-interfaces/src';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { buildUseLoadableForSingleCategorizableType } from '../components/higher-order-components/buildUseLoadableResourcesOfSingleType';
import { ResourcePage } from '../components/higher-order-components/resource-page';
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
                            // @ts-expect-error fix types
                            useLoadableModels={buildUseLoadableForSingleCategorizableType(
                                categorizableType
                            )}
                            IndexPresenter={tableViewCategorizableIndexPresenterFactory(
                                categorizableType
                            )}
                            filter={indexFilter}
                        />
                    }
                />
                <Route
                    path={routeBuilder.detail()}
                    element={
                        <ResourcePage
                            categorizableType={categorizableType}
                            detailPresenterFactory={detailPresenterFactory}
                        />
                    }
                />
            </>
        );
    });
};
