import { CategorizableType, isResourceType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { About } from '../components/about/about';
import { Credits } from '../components/credits/credits';
import { Home } from '../components/home/home';
import { ListenLivePage } from '../components/listen-live-page/listen-live-page';
import { NotFoundPresenter } from '../components/not-found';
import { NoteIndexContainer } from '../components/notes/note-index.container';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { TagDetailContainer } from '../components/tags/tag-detail.container';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import { ConfigurableContent } from '../configurable-front-matter/data/configurable-content-schema';
import { bootstrapIndexToDetailFlowRoutes } from './bootstrap-index-to-detail-flow-routes';
import { routes } from './routes/routes';

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
    } = contentConfig;

    const noteIndexToDetailConfig = indexToDetailFlows.find(
        ({ categorizableType }) => categorizableType === CategorizableType.note
    );

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
            (acc, { categorizableType, route }) => ({
                ...acc,
                [categorizableType]:
                    route || routes.resources.ofType(categorizableType as ResourceType).index,
            }),
            {}
        );

    type RouteFlag = boolean;

    const routeDefinitions: (
        | CoscradRoute
        | [RouteFlag, (config?: ConfigurableContent) => CoscradRoute]
    )[] = [
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
            element: (
                <ResourceInfoContainer
                    resourceTypesAndLabels={resourceTypesAndLabels}
                    resourceTypesAndRoutes={resourceTypesAndRoutes}
                />
            ),
        },
        [
            !isNullOrUndefined(noteIndexToDetailConfig) && shouldEnableWebOfKnowledgeForResources,
            () => ({
                path: noteIndexToDetailConfig.route || 'Notes',
                label: noteIndexToDetailConfig.label || 'Notes',
                element: <NoteIndexContainer />,
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
                element: <TagDetailContainer />,
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
        {
            path: 'Credits',
            label: 'Credits',
            element: <Credits />,
        },
        ...bootstrapIndexToDetailFlowRoutes(contentConfig),
        {
            path: '*',
            element: <NotFoundPresenter />,
        },
    ];

    return routeDefinitions
        .filter((input) => !Array.isArray(input) || input[0])
        .map((input) => (Array.isArray(input) ? input[1](contentConfig) : input));
};
