import Typography from '@mui/material/Typography';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import About from '../Components/Pages/About/About';
import Apps from '../Components/Pages/Apps/Apps';
import Contact from '../Components/Pages/Contact/Contact';
import { FundersContainer } from '../Components/Pages/Funders/Funders.container';
import Greetings from '../Components/Pages/Greetings/Greetings';
import Home from '../Components/Pages/Home/Home';
import { LinksContainer } from '../Components/Pages/Links/Links.container';
import SongDetail from '../Components/Pages/SongDetail/SongDetail';
import Songs from '../Components/Pages/SongIndex/SongIndex';
import Teachers from '../Components/Pages/Teachers/Teachers';
import VideoDetail from '../Components/Pages/VideoDetail/VideoDetail';
import Videos from '../Components/Pages/VideoIndex/VideoIndex';
import Footer from '../Components/Widgets/Footer/Footer';
import Navbar from '../Components/Widgets/Navbar/Navbar';

export function App() {
    return (
        <Typography component={'span'} variant={'body2'}>
            <BrowserRouter>
                <Navbar />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/About" element={<About />} />
                    <Route path="/Apps" element={<Apps />} />
                    <Route path="/Songs" element={<Songs />} />
                    <Route path="/Songs/:id" element={<SongDetail />} />
                    <Route path="/Videos" element={<Videos />} />
                    <Route path="/Videos/:id" element={<VideoDetail />} />
                    <Route path="/Links" element={<LinksContainer />} />
                    <Route path="/Teachers" element={<Teachers />} />
                    <Route path="/Funders" element={<FundersContainer />} />
                    <Route path="/Greetings" element={<Greetings />} />
                    <Route path="/Contact" element={<Contact />} />
                    <Route
                        path="*"
                        element={
                            <div style={{ minHeight: '100vh', textAlign: 'center' }}>
                                <h1>404</h1>
                                <p>Nothing to see here!</p>
                            </div>
                        }
                    ></Route>
                </Routes>
                <Footer />
            </BrowserRouter>
        </Typography>
    );
}

export default App;
