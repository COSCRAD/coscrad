import { useContext } from 'react';
import { buildRoutes } from '../../app/build-routes';
import { ID_ROUTE_PARAM_KEY } from '../../app/routes';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavMenuPresenter } from './nav-menu-presenter';

export type NavItemInfo = {
    link: string;
    label: string;
};

export const NavMenuContainer = (): JSX.Element => {
    const contentConfig = useContext(ConfigurableContentContext);

    const navItems = buildRoutes(contentConfig)
        // TODO We should have a `shouldPublishInMenu` or `menus: string[]`  prop on CoscradRoute
        .filter(({ path }) => !path.includes(`Resources/`))
        .filter(({ path }) => path !== '/')
        .filter(({ path }) => !path.includes(ID_ROUTE_PARAM_KEY))
        .map(({ path }) => ({
            // TODO We should put a separate label prop on CoscradRoute
            label: path,
            link: path,
        }));

    return <NavMenuPresenter navItemInfos={navItems} />;
};
