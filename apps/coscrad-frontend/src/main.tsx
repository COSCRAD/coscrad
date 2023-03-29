import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import App from './app/app';
import { buildRoutes } from './app/build-routes';
import { wrapRoutes } from './app/wrap-routes';
import Auth0ProviderWithHistory from './auth/auth0-provider-with-history';
import { getConfigurableContent } from './configurable-front-matter';
import { ConfigurableContentProvider } from './configurable-front-matter/configurable-content-provider';
import { CoscradThemeProvider } from './coscrad-theme-provider';
import { setupStore } from './store';

const contentConfig = getConfigurableContent();

const routeObjects = [
    wrapRoutes(
        buildRoutes(contentConfig),
        {
            element: <App />,
        },
        {
            element: (
                <Auth0ProviderWithHistory>
                    <Outlet />
                </Auth0ProviderWithHistory>
            ),
        }
    ),
];

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <StrictMode>
        <Provider store={setupStore()}>
            {/* The following will throw (fail fast) if the content config is invalid */}
            <ConfigurableContentProvider value={contentConfig}>
                <CoscradThemeProvider>
                    <RouterProvider router={createBrowserRouter(routeObjects)} />
                </CoscradThemeProvider>
            </ConfigurableContentProvider>
        </Provider>
    </StrictMode>
);
