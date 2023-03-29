import { CategorizableType } from '@coscrad/api-interfaces';
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
    const resourceTypesAndRoutes = indexToDetailFlows.reduce(
        (acc, { categorizableType, route }) => {
            if (categorizableType === CategorizableType.note) {
                return {
                    ...acc,
                    [CategorizableType.note]: route || routes.notes.index,
                };
            }

            return {
                ...acc,
                [categorizableType]: route || routes.resources.ofType(categorizableType).index,
            };
        },
        {}
    );

    const indexToDetailFlowsRoutes: CoscradRoute[] = indexToDetailFlows.flatMap(
        ({ categorizableType, detailViewType, indexFilter }) => {
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
            ];
        }
    );

    return indexToDetailFlowsRoutes;
};
