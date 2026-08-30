import { useAuth0 } from '@auth0/auth0-react';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { userLoginSucceeded } from '../components/auth/store/auth-slice';
import { Header } from '../components/header/header';
import { Home } from '../components/home/home';
import { TermContainer } from '../components/resources/terms/term-container';
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
        <Box>
            <Header />

            <Box sx={{ paddingTop: '120px', marginLeft: '60px', width: '70%' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/terms" element={<TermIndex />} />
                    <Route path="/terms/:id" element={<TermContainer />} />
                </Routes>
            </Box>
        </Box>
    );
}

export default App;
