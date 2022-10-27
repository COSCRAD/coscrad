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
import { TagDetailContainer } from '../components/Tags/TagDetail.container';
import { TagIndexContainer } from '../components/Tags/TagIndex.container';
import { CategoryTreeContainer } from '../components/TreeOfKnowledge/CategoryTree.container';
import './App.css';

export function App() {
    return (
        <div className="main">
            <Header />
            <div>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="About" element={<About />} />
                    <Route path="AllResources" element={<AllResources />} />
                    <Route path="MembersOnly" element={<MembersOnly />} />
                    <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                    <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
                    <Route path="Notes" element={<NoteIndexContainer />} />
                    <Route path="Notes/:id" element={<NoteDetailContainer />} />
                    <Route path="Tags" element={<TagIndexContainer />} />
                    <Route path="Tags/:id" element={<TagDetailContainer />} />
                    <Route path="TreeOfKnowledge" element={<CategoryTreeContainer />} />
                    <Route path="Resources/Terms" element={<TermIndexContainer />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
