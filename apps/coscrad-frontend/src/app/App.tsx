import { ResourceType } from '@coscrad/api-interfaces';
import { Route, Routes } from 'react-router-dom';
import { About } from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';
import { Home } from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import { NoteDetailContainer } from '../components/Notes/NoteDetail.container';
import { NoteIndexContainer } from '../components/Notes/NoteIndex.container';
import { PhotographDetailContainer } from '../components/resources/photographs/photograph-detail.container';
import { PhotographIndexContainer } from '../components/resources/photographs/photograph-index.container';
import { TermIndexContainer } from '../components/resources/terms';
import { TermDetailContainer } from '../components/resources/terms/TermDetail.container';
import { TagDetailContainer } from '../components/Tags/TagDetail.container';
import { TagIndexContainer } from '../components/Tags/TagIndex.container';
import { CategoryTreeContainer } from '../components/TreeOfKnowledge/CategoryTree.container';
import './App.css';
import { routes } from './routes/routes';

export function App() {
    return (
        <div className="app">
            <Header />
            <div className="main-content">
                <Routes>
                    <Route path={routes.home} element={<Home />} />
                    <Route path={routes.about} element={<About />} />
                    <Route path={routes.resources.info} element={<AllResources />} />
                    <Route path={routes.notes.index} element={<NoteIndexContainer />} />
                    <Route path={routes.notes.detail()} element={<NoteDetailContainer />} />
                    <Route path={routes.tags.index} element={<TagIndexContainer />} />
                    <Route path={routes.tags.detail()} element={<TagDetailContainer />} />
                    <Route path={routes.treeOfKnowledge} element={<CategoryTreeContainer />} />
                    <Route
                        path={routes.resources.ofType(ResourceType.term).index}
                        element={<TermIndexContainer />}
                    />
                    <Route
                        path={routes.resources.ofType(ResourceType.term).detail()}
                        element={<TermDetailContainer />}
                    />
                    <Route
                        path={routes.resources.ofType(ResourceType.photograph).index}
                        element={<PhotographIndexContainer />}
                    />
                    <Route
                        path={routes.resources.ofType(ResourceType.photograph).detail()}
                        element={<PhotographDetailContainer />}
                    />
                    {/* The following are temporary or experimental */}
                    <Route path="MembersOnly" element={<MembersOnly />} />
                    <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                    <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
                </Routes>
            </div>
            <Footer></Footer>
        </div>
    );
}

export default App;
