import { AggregateType, CategorizableType } from '@coscrad/api-interfaces';
import { isNonEmptyObject, isNullOrUndefined } from '@coscrad/validation-constraints';
import { About } from '../components/about/about';
import { AdditionalMaterials } from '../components/additional-materials/additional-materials';
import { Credits } from '../components/credits/credits';
import { AggregatePage } from '../components/higher-order-components/aggregate-page';
import { Home } from '../components/home/home';
import { Links } from '../components/links/links';
import { ListenLivePage } from '../components/listen-live-page/listen-live-page';
import { NotFoundPresenter } from '../components/not-found';
import { NoteDetailPageContainer } from '../components/notes/note-detail-page.container';
import { NoteIndexContainer } from '../components/notes/note-index.container';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { TagDetailPresenter } from '../components/tags/tag-detail.presenter';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import { ConfigurableContent } from '../configurable-front-matter/data/configurable-content-schema';
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
            !isNullOrUndefined(externalLinks),
            () => ({
                path: 'Links',
                label: 'Links',
                element: <Links />,
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
        [
            isNonEmptyObject(contentConfig.alphabetConfig),
            (_contentConfig: ConfigurableContent) => ({
                path: 'Alphabet',
                label: 'Alphabet',
                element: <AlphabetPage />,
            }),
        ],
    ];

    return routeDefinitions
        .filter((input) => !Array.isArray(input) || input[0])
        .map((input) => (Array.isArray(input) ? input[1](contentConfig) : input));
};
