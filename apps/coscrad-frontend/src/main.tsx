import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { AppContainer } from './app/App.container';
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';
import { setupStore } from './store';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Provider store={setupStore()}>
            <BrowserRouter>
                <Auth0ProviderWithHistory>
                    <AppContainer />
                </Auth0ProviderWithHistory>
            </BrowserRouter>
        </Provider>
    </StrictMode>
);
