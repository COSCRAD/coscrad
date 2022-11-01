import './NavBar.css';
import { NavBarItem } from './NavBarItem';

export type NavItemInfo = {
    link: string;
    label: string;
};

// We may want an enum \ constants for our routes
const navItemInfos: NavItemInfo[] = [
    {
        link: '/',
        label: 'Home',
    },
    {
        link: '/About',
        label: 'About',
    },
    {
        link: '/AllResources',
        label: 'Browse Resources',
    },
    {
        link: '/MembersOnly',
        label: 'Members Only',
    },
    {
        link: '/Tags',
        label: 'Tags',
    },
    {
        link: '/Notes',
        label: 'Notes',
    },
    {
        link: '/TreeOfKnowledge',
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
