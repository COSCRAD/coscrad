import { routes } from '../../app/routes/routes';
import './NavBar.css';
import { NavBarItem } from './NavBarItem';

export type NavItemInfo = {
    link: string;
    label: string;
};

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
    // This is experimental only
    {
        link: '/MembersOnly',
        label: 'Members Only',
    },
    {
        link: routes.tags.index,
        label: 'Tags',
    },
    {
        link: routes.notes.index,
        label: 'Notes',
    },
    {
        link: routes.treeOfKnowledge,
        label: 'Tree of Knowledge',
    },
];

// TODO: We should have a NavBar container and presenter
export const NavBar = (): JSX.Element => {
    return (
        <ul>
            {navItemInfos.map((info, index) => (
                <NavBarItem {...info} key={index} />
            ))}
        </ul>
    );
};
