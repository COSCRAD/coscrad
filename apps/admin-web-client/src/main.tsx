import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import Auth0ProviderWithHistory from './components/auth/auth0-provider-with-history';
import { CoscradThemeProvider } from './coscrad-theme-provider';
import { store } from './store';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Provider store={store}>
            <CoscradThemeProvider>
                <BrowserRouter>
                    <Auth0ProviderWithHistory>
                        <App />
                    </Auth0ProviderWithHistory>
                </BrowserRouter>
            </CoscradThemeProvider>
        </Provider>
    </StrictMode>
);
