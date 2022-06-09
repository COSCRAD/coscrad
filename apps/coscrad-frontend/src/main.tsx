import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './app/App';
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';

ReactDOM.render(
    <StrictMode>
        <BrowserRouter>
            <Auth0ProviderWithHistory>
                <App />
            </Auth0ProviderWithHistory>
        </BrowserRouter>
    </StrictMode>,
    document.getElementById('root')
);
