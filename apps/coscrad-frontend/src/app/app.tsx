import { isAggregateType } from '@coscrad/api-interfaces';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/about/about';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { Home } from '../components/home/home';
import MembersOnly from '../components/members-only/members-only';
import { ResourceInfoContainer } from '../components/resource-info/resource-info.container';
import { TagDetailContainer } from '../components/tags/tag-detail.container';
import { TagIndexContainer } from '../components/tags/tag-index.container';
import { CategoryTreeContainer } from '../components/tree-of-knowledge/category-tree.container';
import { getConfig } from '../config';
import { fetchFreshState } from '../store/slices/utils/fetch-fresh-state';
import './app.css';
import { useAppDispatch } from './hooks';
import { IndexToDetailFlowRoutes } from './index-to-detail-flow-routes';
import { routes } from './routes/routes';

export function App() {
    const dispatch = useAppDispatch();

    const eventSource = new EventSource(`${getConfig().apiUrl}/commands/notifications`);

    eventSource.onmessage = (result) => {
        /**
         * TODO Move the following somewhere else. `store`?
         *
         * TODO Find a pattern that is closed to modification.
         *
         * TODO In the meantime, write a test that reminds us to update this
         * with each new resource type.
         */
        const message = JSON.parse(result.data);

        const aggregateTypeFromMessage = message.aggregateCompositeIdentifier?.type;

        if (isAggregateType(aggregateTypeFromMessage))
            fetchFreshState(dispatch, aggregateTypeFromMessage);
    };

    return (
        <div className="app">
            <Header />
            <div className="main-content">
                <Routes key="routes">
                    <Route key="home" path={routes.home} element={<Home />} />
                    <Route key="about" path={routes.about} element={<About />} />
                    <Route
                        key="resource-info"
                        path={routes.resources.info}
                        element={<ResourceInfoContainer />}
                    />
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
                    {/* The following are temporary or experimental */}
                    <Route key="members-only" path="MembersOnly" element={<MembersOnly />} />
                </Routes>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default App;
