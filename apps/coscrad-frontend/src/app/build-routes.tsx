import { AggregateType, CategorizableType } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { TermIndexContainer } from '../../term-index.container';
import { About } from '../components/about/about';
import { AdditionalMaterials } from '../components/additional-materials/additional-materials';
import { Credits } from '../components/credits/credits';
import { MemoryMatchIndexPage } from '../components/games/memory-match/memory-match-index.page';
import { AggregatePage } from '../components/higher-order-components/aggregate-page';
import { Home } from '../components/home/home';
import { Links } from '../components/links/links';
import { ListenLivePage } from '../components/listen-live-page/listen-live-page';
import { NotFoundPresenter } from '../components/not-found';
import { NoteDetailPageContainer } from '../components/notes/note-detail-page.container';
import { NoteIndexContainer } from '../components/notes/note-index.container';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { TermDetailFullViewPresenter } from '../components/resources/terms/term-detail.full-view.presenter';
import { TermDetailPage } from '../components/resources/terms/term-detail.page';
import { TermDetailThumbnailPresenter } from '../components/resources/terms/term-detail.thumbnail.presenter';
import { TagDetailPresenter } from '../components/tags/tag-detail.presenter';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import {
    ConfigurableContent,
    DetailViewType,
} from '../configurable-front-matter/data/configurable-content-schema';
import { AlphabetPage } from './../components/alphabet/AlphabetPage';
import { bootstrapIndexToDetailFlowRoutes } from './bootstrap-index-to-detail-flow-routes';

export type CoscradRoute = {
    path: string;
    label?: string;
    element: JSX.Element;
    errorElement?: React.ReactNode;
    fallbackElement?: React.ReactNode;
    children?: CoscradRoute[];
};

export const buildRoutes = (contentConfig: ConfigurableContent): CoscradRoute[] => {
    const {
        indexToDetailFlows,
        shouldEnableWebOfKnowledgeForResources,
        listenLive,
        resourceIndexLabel,
        externalLinks,
        additionalMaterials,
    } = contentConfig;

    const noteIndexToDetailConfig = indexToDetailFlows.find(
        ({ categorizableType }) => categorizableType === CategorizableType.note
    );

    const notesRoute = noteIndexToDetailConfig?.labelOverrides?.label || 'Notes';

    type RouteFlag = boolean;

    const routeDefinitions: (
        | CoscradRoute
        | [RouteFlag, (config?: ConfigurableContent) => CoscradRoute]
    )[] = [
        // note that the base route '/' is configured dynamically according to `contentConfig.landingPage` and this static home page may be overridden below
        {
            path: '/',
            label: 'Home',
            element: <Home />,
        },
        {
            path: 'About',
            label: 'About',
            element: <About />,
        },
        {
            path: 'Resources',
            label: resourceIndexLabel,
            element: <ResourceInfoContainer />,
        },
        [
            !isNullOrUndefined(noteIndexToDetailConfig) && shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: notesRoute,
                label: noteIndexToDetailConfig?.labelOverrides?.label || 'Notes',
                element: <NoteIndexContainer />,
            }),
        ],
        [
            !isNullOrUndefined(noteIndexToDetailConfig) && shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: `${notesRoute}/:id`,
                element: <NoteDetailPageContainer />,
            }),
        ],
        [
            shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: 'TreeOfKnowledge',
                label: 'Tree of Knowledge',
                element: <CategoryTreeContainer />,
            }),
        ],
        [
            shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: 'Tags',
                label: 'Tags',
                element: <TagIndexContainer />,
            }),
        ],
        [
            shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: 'Tags/:id',
                element: (
                    <AggregatePage
                        aggregateType={AggregateType.tag}
                        DetailPresenter={TagDetailPresenter}
                    />
                ),
            }),
        ],
        [
            !isNullOrUndefined(listenLive),
            (contentConfig: ConfigurableContent) => ({
                path: contentConfig.listenLive.route,
                label: contentConfig.listenLive.label,
                element: <ListenLivePage />,
            }),
        ],
        [
            isNonEmptyObject(contentConfig.alphabetConfig),
            (_contentConfig: ConfigurableContent) => ({
                path: 'Alphabet',
                label: 'Alphabet',
                element: <AlphabetPage />,
            }),
        ],
        [
            contentConfig.shouldEnableMemoryMatch,
            (_contentConfig: ConfigurableContent) => ({
                path: 'MemoryMatch',
                label: 'Memory Match',
                element: <MemoryMatchIndexPage />,
            }),
        ],
        [
            additionalMaterials.length > 0,
            () => ({
                path: 'Additional Materials',
                // TODO pull this label from the config
                label: 'Additional Materials',
                element: <AdditionalMaterials />,
            }),
        ],
        [
            !isNullOrUndefined(externalLinks),
            () => ({
                path: 'Links',
                label: 'Links',
                element: <Links />,
            }),
        ],
        {
            path: 'Credits',
            label: 'Credits',
            element: <Credits />,
        },
        ...bootstrapIndexToDetailFlowRoutes(contentConfig),
        [
            indexToDetailFlows.some(
                ({ categorizableType }) => categorizableType === CategorizableType.term
            ),
            () => {
                const { labelOverrides } = indexToDetailFlows.find(
                    ({ categorizableType }) => categorizableType === CategorizableType.term
                );

                const path = `Resources/${labelOverrides?.route || 'Terms'}`;

                return {
                    path,
                    label: labelOverrides?.pluralLabel || 'Terms',
                    // TODO move this file
                    element: <TermIndexContainer />,
                };
            },
        ],
        [
            indexToDetailFlows.some(
                ({ categorizableType }) => categorizableType === CategorizableType.term
            ),
            () => {
                const { labelOverrides, detailViewType } = indexToDetailFlows.find(
                    ({ categorizableType }) => categorizableType === CategorizableType.term
                );

                const baseRoute = labelOverrides?.route || 'Terms';

                const path = `Resources/${baseRoute}/:id`;

                const DetailPresenter =
                    detailViewType === DetailViewType.fullView
                        ? TermDetailFullViewPresenter
                        : TermDetailThumbnailPresenter;

                return {
                    path,
                    label: labelOverrides?.label || 'Term',
                    element: <TermDetailPage DetailPresenter={DetailPresenter} />,
                };
            },
        ],
        {
            path: '*',
            element: <NotFoundPresenter />,
        },
    ];

    const searchResultForDynamicLandingRoute = routeDefinitions.flatMap((routeDefinition) => {
        let targetRouteDefinition: CoscradRoute;

        if (Array.isArray(routeDefinition)) {
            // this is an optional route depending on the content config
            if (!routeDefinition[0]) {
                return [];
            }

            targetRouteDefinition = routeDefinition[1](contentConfig);
        } else {
            targetRouteDefinition = routeDefinition;
        }

        // match
        if (targetRouteDefinition.path === contentConfig.landingPage) {
            return [targetRouteDefinition];
        }

        // no result found
        return [];
    });

    if (
        searchResultForDynamicLandingRoute.length === 1 &&
        isNonEmptyObject(searchResultForDynamicLandingRoute[0])
    ) {
        const dynamicHomeRouteDefinition = {
            path: '/',
            label: 'Home',
            element: searchResultForDynamicLandingRoute[0].element,
        };

        routeDefinitions[0] = dynamicHomeRouteDefinition;
    }

    return routeDefinitions.flatMap(
        // filter + map
        (input) =>
            // keep static routes and dynamic ones with true for the 0th element of the tuple (the keep flag)
            !Array.isArray(input) || input[0]
                ? // If we have a tuple, the 1st element is a route definition factory and we inject the config, otherwise, we have a static route definition
                  [Array.isArray(input) ? input[1](contentConfig) : input]
                : []
    );

    //    .filter((input) => !Array.isArray(input) || input[0])
    //  .map((input) => (Array.isArray(input) ? input[1](contentConfig) : input));
};
