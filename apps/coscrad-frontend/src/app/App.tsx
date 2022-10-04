import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import { DynamicResourceDetailPage } from '../components/dynamicViews/dynamicResourceDetailView/DynamicResourceDetailPage';
import { DynamicIndexPage } from '../components/dynamicViews/dynamicResourceIndexView';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';

export function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="About" element={<About />} />
                <Route path="AllResources" element={<AllResources />} />
                <Route path="MembersOnly" element={<MembersOnly />} />
                <Route path="ResourceIndex" element={<DynamicIndexPage />} />
                <Route path="ResourceDetail" element={<DynamicResourceDetailPage />} />
            </Routes>
        </div>
    );
}

export default App;
