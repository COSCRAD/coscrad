import { useAuth0 } from '@auth0/auth0-react';
import { Box, Divider } from '@mui/material';
import { useEffect } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import { userLoginSucceeded } from '../components/auth/store/auth-slice';
import { Home } from '../components/home/home';
import { NavMenuPresenter } from '../components/nav-menu/nav-menu-presenter';
import { TermDetailContainer } from '../components/resources/terms/term-detail-container';
import { TermIndex } from '../components/resources/terms/term-index.page';
import { useAppDispatch } from './hooks';

export function App() {
    const { isAuthenticated, getAccessTokenSilently, user } = useAuth0();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isAuthenticated) {
            getAccessTokenSilently().then((token) => {
                dispatch(
                    userLoginSucceeded({
                        userId: user?.sub,
                        token,
                    })
                );
            });
        }
    });

    return (
        <Box sx={{ marginTop: '50px', marginLeft: '40px' }}>
            <nav>
                <Link to="/">Home</Link>
                &nbsp;|&nbsp;
                <Link to="/terms">Terms</Link>
                <NavMenuPresenter />
            </nav>

            <Divider sx={{ height: '20px', marginBottom: '10px' }} />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/terms" element={<TermIndex />} />
                <Route path="/terms/:id" element={<TermDetailContainer />} />
            </Routes>
        </Box>
    );
}

export default App;
