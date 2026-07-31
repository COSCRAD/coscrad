import { useAuth0 } from '@auth0/auth0-react';
import { Box } from '@mui/material';
import { useEffect } from 'react';
import { Route, Routes } from 'react-router-dom';
import { userLoginSucceeded } from '../components/auth/store/auth-slice';
import { Footer } from '../components/footer/footer';
import { Header } from '../components/header/header';
import { Home } from '../components/home/home';
import { TermContainer } from '../components/resources/terms/term-container';
import { TermIndexPage } from '../components/resources/terms/term-index.page';
import { VocabularyListDetail } from '../components/resources/vocabulary-lists/vocabulary-list-detail.page';
import { VocabularyListsIndex } from '../components/resources/vocabulary-lists/vocabulary-list-index.page';
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

            <Box sx={{ paddingTop: '120px', ml: 10, mb: 5, width: '90%' }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/terms" element={<TermIndexPage />} />
                    <Route path="/terms/:id" element={<TermContainer />} />
                    <Route path="/vocabularyLists" element={<VocabularyListsIndex />} />
                    <Route path="/vocabularyLists/:id" element={<VocabularyListDetail />} />
                </Routes>
            </Box>

            <Footer />
        </Box>
    );
}

export default App;
