import { isResourceType, ResourceType } from '@coscrad/api-interfaces';
import { Fragment, useContext } from 'react';
import { Route } from 'react-router-dom';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { CategorizablePage } from '../components/higher-order-components/categorizable-page';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { fullViewCategorizablePresenterFactory } from '../components/resources/factories/full-view-categorizable-presenter-factory';
import { tableViewCategorizableIndexPresenterFactory } from '../components/resources/factories/table-view-categorizable-index-presenter-factory';
import { thumbnailCategorizableDetailPresenterFactory } from '../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { ConfigurableContentContext } from '../configurable-front-matter/configurable-content-provider';
import { DetailViewType } from '../configurable-front-matter/data/configurable-content-schema';
import { routes } from './routes/routes';

export const IndexToDetailFlowRoutes = () => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    const resourceTypesAndLabels = indexToDetailFlows
        .filter(({ categorizableType }) => isResourceType(categorizableType))
        .reduce(
            (acc, { categorizableType: resourceType, label }) => ({
                ...acc,
                [resourceType]: label || `${resourceType}s`,
            }),
            {}
        );

    const resourceTypesAndRoutes = indexToDetailFlows
        .filter(({ categorizableType }) => isResourceType(categorizableType))
        .reduce(
            (acc, { categorizableType: resourceType, route }) => ({
                ...acc,
                [resourceType]:
                    route || routes.resources.ofType(resourceType as ResourceType).index,
            }),
            {}
        );

    const Menu = (
        <Route
            key="resource-info"
            path={routes.resources.info}
            element={
                <ResourceInfoContainer
                    resourceTypesAndLabels={resourceTypesAndLabels}
                    resourceTypesAndRoutes={resourceTypesAndRoutes}
                />
            }
        />
    );

    const IndexToDetailFlows = indexToDetailFlows.map(
        ({ categorizableType, detailViewType, indexFilter, label }) => {
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

            const indexRoute = resourceTypesAndRoutes[categorizableType];

            const detailRoute = `${resourceTypesAndRoutes[categorizableType]}/:id`;

            console.log({
                indexRoute,
                detailRoute,
            });

            return (
                <Fragment key="categorizable-index-to-detail-flows">
                    <Route
                        key={`${categorizableType}-index`}
                        path={indexRoute}
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
                        key={`${categorizableType}-${label}-detail`}
                        path={detailRoute}
                        element={
                            <CategorizablePage
                                categorizableType={categorizableType}
                                detailPresenterFactory={detailPresenterFactory}
                            />
                        }
                    />
                </Fragment>
            );
        }
    );

    return (
        <>
            {Menu}
            {IndexToDetailFlows}
        </>
    );
};
