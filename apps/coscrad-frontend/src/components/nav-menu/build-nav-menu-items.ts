import { buildRoutes } from '../../app/build-routes';
import { ID_ROUTE_PARAM_KEY } from '../../app/routes';
import { ConfigurableContent } from '../../configurable-front-matter/data/configurable-content-schema';

const unlistedRoutes = ['*'];

export const buildNavMenuItems = (contentConfig: ConfigurableContent) => {
    const routes = buildRoutes(contentConfig);

    // TODO We should have a `shouldPublishInMenu` or `menus: string[]`  prop on CoscradRoute
    return routes
        .filter(({ path }) => !path.includes(`Resources/`))
        .filter(({ path }) => !unlistedRoutes.includes(path))
        .filter(({ path }) => !path.includes(ID_ROUTE_PARAM_KEY))
        .map(({ path, label }) => ({
            label,
            link: path,
        }));
};
