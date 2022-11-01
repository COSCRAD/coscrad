import { ResourceType } from '@coscrad/api-interfaces';
import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Header from '../components/Header/Header';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import { NoteDetailContainer } from '../components/Notes/NoteDetail.container';
import { NoteIndexContainer } from '../components/Notes/NoteIndex.container';
import { TermIndexContainer } from '../components/resources/Terms';
import { TermDetailContainer } from '../components/resources/Terms/TermDetail.container';
import { TagDetailContainer } from '../components/Tags/TagDetail.container';
import { TagIndexContainer } from '../components/Tags/TagIndex.container';
import { CategoryTreeContainer } from '../components/TreeOfKnowledge/CategoryTree.container';
import './App.css';
import { routes } from './routes/routes';

export function App() {
    return (
        <div className="main">
            <Header />
            <div>
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
                    {/* The following are temporary or experimental */}
                    <Route path="MembersOnly" element={<MembersOnly />} />
                    <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                    <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
