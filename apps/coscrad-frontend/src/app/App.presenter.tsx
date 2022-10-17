import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Header from '../components/Header/Header ';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';
import { ConfigurableContent } from '../configurable-front-matter/data/configSchema';
import './App.module.scss';

type AppPresenterProps = {
    content: ConfigurableContent;
};

export function App({ content }: AppPresenterProps) {
    /**
     * [TODO] It is important that we do not expose the entire configurable
     * content object to each of the components. Instead, we should inject
     * just the "slice" of the configurable content that each component
     * actually needs. Principle of Least Privilege.
     */
    return (
        <div className="main">
            <Header frontMatter={content}></Header>
            <div>
                <Routes>
                    <Route path="/" element={<Home frontMatter={content} />} />
                    <Route path="About" element={<About frontMatter={content} />} />
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
