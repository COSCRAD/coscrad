import { createBrowserRouter, Outlet } from 'react-router-dom';
import Auth0ProviderWithHistory from '../auth/auth0-provider-with-history';
import { ErrorDisplay } from '../components/error-display/error-display';
import { Loading } from '../components/loading';
import { ConfigurableContent } from '../configurable-front-matter/data/configurable-content-schema';
import App from './app';
import { buildRoutes } from './build-routes';
import { wrapRoutes } from './wrap-routes';

export const createAppRouter = (config: ConfigurableContent) => {
    const routeObjects = [
        wrapRoutes(
            buildRoutes(config),
            {
                element: <App />,
                errorElement: <ErrorDisplay message="Route not Found" code={400} />,
                fallbackElement: <Loading />,
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

    return createBrowserRouter(routeObjects);
};
