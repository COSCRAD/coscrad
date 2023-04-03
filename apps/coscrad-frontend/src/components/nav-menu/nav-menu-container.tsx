import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { buildNavMenuItems } from './build-nav-menu-items';
import { NavMenuPresenter } from './nav-menu-presenter';

export type NavItemInfo = {
    link: string;
    label: string;
};

export const NavMenuContainer = (): JSX.Element => {
    const contentConfig = useContext(ConfigurableContentContext);

    /**
     * The menu items are built dynamically from the config. Omitting certain
     * properties means that the corresponding page routes do not exist and so
     * these pages must be omitted from the menu.
     */
    return <NavMenuPresenter navItemInfos={buildNavMenuItems(contentConfig)} />;
};
