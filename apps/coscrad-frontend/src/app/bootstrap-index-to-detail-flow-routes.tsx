import { CategorizableType, ResourceType } from '@coscrad/api-interfaces';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { CategorizablePage } from '../components/higher-order-components/categorizable-page';
import { fullViewCategorizablePresenterFactory } from '../components/resources/factories/full-view-categorizable-presenter-factory';
import { tableViewCategorizableIndexPresenterFactory } from '../components/resources/factories/table-view-categorizable-index-presenter-factory';
import { thumbnailCategorizableDetailPresenterFactory } from '../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import {
    ConfigurableContent,
    DetailViewType,
} from '../configurable-front-matter/data/configurable-content-schema';
import { CoscradRoute } from './build-routes';
import { routes } from './routes/routes';

export const bootstrapIndexToDetailFlowRoutes = ({
    indexToDetailFlows,
    simulatedKeyboard,
}: ConfigurableContent): CoscradRoute[] => {
    const resourceTypesAndRoutes = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType !== CategorizableType.note)
        .reduce(
            (acc, { categorizableType, route }) => ({
                ...acc,
                [categorizableType]:
                    // we have already filtered out the Notes
                    (route && `Resources/${route}`) ||
                    routes.resources.ofType(categorizableType as ResourceType).index,
            }),
            {}
        );

    const indexToDetailFlowsRoutes: CoscradRoute[] = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType !== CategorizableType.note)
        .flatMap(({ categorizableType, detailViewType, indexFilter }) => {
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

            return [
                {
                    path: indexRoute,
                    element: (
                        <FilteredCategorizableIndexContainer
                            IndexPresenter={tableViewCategorizableIndexPresenterFactory(
                                categorizableType
                            )}
                            preFilter={indexFilter}
                            aggregateType={categorizableType}
                            simulatedKeyboard={simulatedKeyboard}
                        />
                    ),
                },
                {
                    path: detailRoute,
                    element: (
                        <CategorizablePage
                            categorizableType={categorizableType}
                            detailPresenterFactory={detailPresenterFactory}
                        />
                    ),
                },
            ] as const;
        });

    return indexToDetailFlowsRoutes;
};
