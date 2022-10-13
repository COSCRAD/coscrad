import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Header from '../components/Header/Header ';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import getFrontMatter from '../configurable-front-matter/getFrontMatter';
import './App.module.scss';

const frontMatterReadResult = getFrontMatter();

export function App() {
    if (frontMatterReadResult instanceof Error)
        return (
            <div>
                <h1>Error Boundary</h1>
                <p>
                    This application has encountered the following error:&nbsp;
                    {frontMatterReadResult.message}
                </p>
            </div>
        );
    return (
        <div className='main'>
            <Header frontMatter={frontMatterReadResult}></Header>
            <div>
                <Routes>
                    <Route path="/" element={<Home frontMatter={frontMatterReadResult} />} />
                    <Route path="About" element={<About frontMatter={frontMatterReadResult} />} />
                    <Route path="AllResources" element={<AllResources />} />
                    <Route path="MembersOnly" element={<MembersOnly />} />
                    <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                    <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
                </Routes>
            </div>
        </div>
    );
}

export default App;
