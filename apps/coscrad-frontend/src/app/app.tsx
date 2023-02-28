import { isAggregateType } from '@coscrad/api-interfaces';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/about/about';
import { Credits } from '../components/credits/credits';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { Home } from '../components/home/home';
import MembersOnly from '../components/members-only/members-only';
import { TagDetailContainer } from '../components/tags/tag-detail.container';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import { getConfig } from '../config';
import { fetchFreshState } from '../store/slices/utils/fetch-fresh-state';
import { CoscradLayoutContainer } from './coscrad-layout-container';
import { useAppDispatch } from './hooks';
import { IndexToDetailFlowRoutes } from './index-to-detail-flow-routes';
import { routes } from './routes/routes';

export function App() {
    const dispatch = useAppDispatch();

    const { listenLive } = useContext(ConfigurableContentContext);

    const shouldRenderListenLivePage = !isNullOrUndefined(listenLive);

    const eventSource = new EventSource(`${getConfig().apiUrl}/commands/notifications`);

    eventSource.onmessage = (result) => {
        /**
         * TODO Move the following somewhere else. `store`?
         *
         * TODO [https://www.pivotaltracker.com/story/show/184183811]
         * In the meantime, write a test that reminds us to update this
         * with each new resource type.
         */
        const message = JSON.parse(result.data);

        const aggregateTypeFromMessage = message.aggregateCompositeIdentifier?.type;

        if (isAggregateType(aggregateTypeFromMessage))
            fetchFreshState(dispatch, aggregateTypeFromMessage);
    };

    return (
        <>
            <Header />
            <CoscradLayoutContainer>
                {/**
                 * TODO: Break out utility function to bootstrap all routes
                 */}
                <Routes key="routes">
                    <Route key="home" path={routes.home} element={<Home />} />
                    <Route key="about" path={routes.about} element={<About />} />
                    <Route
                        key="tag-index"
                        path={routes.tags.index}
                        element={<TagIndexContainer />}
                    />
                    <Route
                        key="tag-detail"
                        path={routes.tags.detail()}
                        element={<TagDetailContainer />}
                    />
                    <Route
                        key="category-tree"
                        path={routes.treeOfKnowledge}
                        element={<CategoryTreeContainer />}
                    />
                    {IndexToDetailFlowRoutes()}
                    {shouldRenderListenLivePage ? (
                        <Route
                            key="listen-live-page"
                            path={routes.listenLive}
                            element={<ListenLivePage />}
                        />
                    ) : null}
                    {/* The following are temporary or experimental */}
                    <Route key="members-only" path="MembersOnly" element={<MembersOnly />} />
                    <Route key="credits" path={routes.siteCredits} element={<Credits />} />
                </Routes>
            </CoscradLayoutContainer>
            <Footer />
        </>
    );
}

export default App;
