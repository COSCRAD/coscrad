import { CategorizableType, isResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { About } from '../components/about/about';
import { Credits } from '../components/credits/credits';
import { Home } from '../components/home/home';
import { ListenLivePage } from '../components/listen-live-page/listen-live-page';
import { NoteIndexContainer } from '../components/notes/note-index.container';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { TagDetailContainer } from '../components/tags/tag-detail.container';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import { ConfigurableContent } from '../configurable-front-matter/data/configurable-content-schema';
import { contentConfig } from '../configurable-front-matter/data/content.config';
import { bootstrapIndexToDetailFlowRoutes } from './bootstrap-index-to-detail-flow-routes';
import { routes } from './routes/routes';

export type CoscradRoute = {
    path: string;
    element: JSX.Element;
    children?: CoscradRoute[];
};

export const buildRoutes = ({
    indexToDetailFlows,
    shouldEnableWebOfKnowledgeForResources,
    listenLive,
}: ConfigurableContent): CoscradRoute[] => {
    const noteIndexToDetailConfig = indexToDetailFlows.find(
        ({ categorizableType }) => categorizableType === CategorizableType.note
    );

    const dynamicRoutes: CoscradRoute[] = [
        ...(!isNullOrUndefined(noteIndexToDetailConfig) && shouldEnableWebOfKnowledgeForResources
            ? [
                  {
                      path: noteIndexToDetailConfig.route || 'Notes',
                      element: <NoteIndexContainer />,
                  },
              ]
            : []),
        ...(!isNullOrUndefined(listenLive)
            ? [
                  {
                      path: 'Live', // TODO pull the route off of `listenLive` prop
                      element: <ListenLivePage />,
                  },
              ]
            : []),
        ...(shouldEnableWebOfKnowledgeForResources
            ? [
                  {
                      path: 'Tags',
                      element: <TagIndexContainer />,
                  },
                  {
                      path: 'Tags/:id',
                      element: <TagDetailContainer />,
                  },
                  {
                      path: 'TreeOfKnowledge',
                      element: <CategoryTreeContainer />,
                  },
                  ...bootstrapIndexToDetailFlowRoutes(contentConfig),
              ]
            : []),
    ];

    const resourceTypesAndLabels = indexToDetailFlows
        .filter(({ categorizableType }) => isResourceType(categorizableType))
        .reduce(
            (acc, { categorizableType: resourceType, label }) => ({
                ...acc,
                [resourceType]: label || `${resourceType}s`,
            }),
            {}
        );

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

    return [
        {
            path: '/',
            element: <Home />,
        },
        {
            path: 'Resources',
            element: (
                <ResourceInfoContainer
                    resourceTypesAndLabels={resourceTypesAndLabels}
                    resourceTypesAndRoutes={resourceTypesAndRoutes}
                />
            ),
        },
        {
            path: 'About',
            element: <About />,
        },
        {
            path: 'Tags',
            element: <TagIndexContainer />,
        },
        {
            path: 'Credits',
            element: <Credits />,
        },
        ...dynamicRoutes,
    ];
};
