import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Header from '../components/Header/Header';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import { TagDetailContainer } from '../components/Tags/TagDetail.container';
import { TagIndexContainer } from '../components/Tags/TagIndex.container';
import { ConfigurableContent } from '../configurable-front-matter/data/configurableContentSchema';
import './App.css';

type AppProps = {
    content: ConfigurableContent;
};

export function App({ content }: AppProps) {
    return (
        <div className="main">
            <Header {...content}></Header>
            <div>
                <Routes>
                    <Route path="/" element={<Home {...content} />} />
                    <Route path="About" element={<About {...content} />} />
                    <Route path="AllResources" element={<AllResources />} />
                    <Route path="MembersOnly" element={<MembersOnly />} />
                    <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                    <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
                    <Route path="Tags" element={<TagIndexContainer />} />
                    <Route path="Tags/:id" element={<TagDetailContainer />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
