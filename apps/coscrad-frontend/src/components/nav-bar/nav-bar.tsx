import { CategorizableType } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { routes } from '../../app/routes/routes';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import AuthenticationButton from '../authentication-button/authentication-button';
import { NavBarItem } from './nav-bar-item';
import './nav-bar.css';

export type NavItemInfo = {
    link: string;
    label: string;
};

// TODO: We should have a NavBar container and presenter
export const NavBar = (): JSX.Element => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    // note this may be [] if we haven't included `notes`
    const dynamicLinks = indexToDetailFlows
        .filter(({ categorizableType }) => categorizableType === CategorizableType.note)
        .map(({ label, route }) => ({
            link: route || routes.notes.index,
            label: label || 'Notes',
        }));

    // We may want an enum \ constants for our routes
    const navItemInfos: NavItemInfo[] = [
        {
            link: routes.home,
            label: 'Home',
        },
        {
            link: routes.about,
            label: 'About',
        },
        {
            link: routes.resources.info,
            label: 'Browse Resources',
        },
        {
            link: routes.tags.index,
            label: 'Tags',
        },
        {
            link: routes.treeOfKnowledge,
            label: 'Tree of Knowledge',
        },
        ...dynamicLinks,
    ];

    return (
        <ul>
            {navItemInfos.map((info, index) => (
                <NavBarItem {...info} key={index} />
            ))}
            <AuthenticationButton />
        </ul>
    );
};
