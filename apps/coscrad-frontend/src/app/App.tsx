import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import { NavBar } from '../components/NavBar/NavBar';
import './App.module.scss';
import getFrontMatter from './configurable-front-matter/getFrontMatter';

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
            <header>
                <h1>
                    {frontMatterReadResult.siteTitle}
                </h1>
                <h2>
                    {frontMatterReadResult.subTitle}
                </h2>
                <nav>
                    <NavBar></NavBar>
                </nav>
            </header>
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
