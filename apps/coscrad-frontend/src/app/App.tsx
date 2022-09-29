import { Route, Routes } from 'react-router-dom';
import About from '../components/About/About';
import { AllResources } from '../components/AllResources/AllResources';
import DynamicIndexPage from '../components/dynamicViews/dynamicResourceIndexView/DynamicIndexPage';
import Home from '../components/Home/Home';
import MembersOnly from '../components/MembersOnly/MembersOnly';

export function App() {
    return (
        <div>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="About" element={<About />} />
                <Route path="AllEntities" element={<AllResources />} />
                <Route path="MembersOnly" element={<MembersOnly />} />
                <Route path="ResourceIndex" element={<DynamicIndexPage></DynamicIndexPage>} />
            </Routes>
        </div>
    );
}

export default App;
