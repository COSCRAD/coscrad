import { createTheme, ThemeProvider } from '@mui/material';
import { red } from '@mui/material/colors';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import App from './app/app';
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';
import { getConfigurableContent } from './configurable-front-matter';
import { ConfigurableContentProvider } from './configurable-front-matter/configurable-content-provider';
import { setupStore } from './store';

const coscradDefaultTheme = createTheme({
    palette: {
        primary: {
            main: red[500],
        },
    },
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Provider store={setupStore()}>
            <BrowserRouter>
                <Auth0ProviderWithHistory>
                    {/* The following will throw (fail fast) if the content config is invalid */}
                    <ConfigurableContentProvider value={getConfigurableContent()}>
                        <ThemeProvider theme={coscradDefaultTheme}>
                            <App />
                        </ThemeProvider>
                    </ConfigurableContentProvider>
                </Auth0ProviderWithHistory>
            </BrowserRouter>
        </Provider>
    </StrictMode>
);
