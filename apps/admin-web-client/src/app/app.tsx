import { Box, Divider } from '@mui/material';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { TermDetail } from '../components/resources/terms/term-detail.page';
import { TermIndex } from '../components/resources/terms/term-index.page';

export function App() {
    return (
        <BrowserRouter>
            <Box sx={{ marginTop: '50px', marginLeft: '40px' }}>
                <nav>
                    <Link to="/">Home</Link>
                    &nbsp;|&nbsp;
                    <Link to="/terms">Terms</Link>
                </nav>

                <Divider sx={{ height: '20px', marginBottom: '10px' }} />

                <Routes>
                    <Route path="/" />
                    <Route path="/terms" element={<TermIndex />} />
                    <Route path="/terms/:id" element={<TermDetail />} />
                </Routes>
            </Box>
        </BrowserRouter>
    );
}

export default App;
