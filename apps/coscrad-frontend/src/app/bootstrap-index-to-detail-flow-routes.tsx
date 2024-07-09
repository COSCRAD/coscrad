import { CategorizableType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { FilteredCategorizableIndexContainer } from '../components/higher-order-components';
import { AggregatePage } from '../components/higher-order-components/aggregate-page';
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
    /**
     * TODO[https://www.pivotaltracker.com/story/show/185338095]
     *
     * We want to inject `resourceInfos` instead of `ConfigurableContent`. At
     * a higher level we should apply the overrides from the content config to
     * these.
     */
    const resourceTypesAndRoutes = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType !== CategorizableType.note)
        .reduce((acc, { categorizableType, labelOverrides }) => {
            const route = isNullOrUndefined(labelOverrides) ? null : labelOverrides.route;

            const resolvedRoute =
                (route && `Resources/${route}`) ||
                routes.resources.ofType(categorizableType as ResourceType).index;

            return {
                ...acc,
                [categorizableType]:
                    // we have already filtered out the Notes
                    resolvedRoute,
            };
        }, {});

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
                        <AggregatePage
                            aggregateType={categorizableType}
                            DetailPresenter={detailPresenterFactory(categorizableType)}
                        />
                    ),
                },
            ] as const;
        });

    return indexToDetailFlowsRoutes;
};
