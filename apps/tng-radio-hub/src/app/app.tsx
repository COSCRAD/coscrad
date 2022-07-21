import { Route, Routes } from 'react-router-dom';
import About from '../Components/pages/about/about';
import Contact from '../Components/pages/contact/contact';
import Funders from '../Components/pages/funders/funders';
import Home from '../Components/pages/home/home';
import Links from '../Components/pages/links/links';
import Stream from '../Components/pages/stream/stream';


export function App() {
    return (
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/stream" element={<Stream />} />
            <Route path="/links" element={<Links />} />
            <Route path="/Contact" element={<Contact />} />
            <Route path="/funders" element={<Funders />} />
            </Routes>
    );
}

export default App;
