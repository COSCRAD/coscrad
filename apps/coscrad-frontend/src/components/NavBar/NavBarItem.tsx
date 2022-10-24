import { Link } from 'react-router-dom';
import { NavItemInfo } from './NavBar';

export const NavBarItem = ({ link, label }: NavItemInfo) => (
    <li>
        <Link to={link}>{label}</Link>
    </li>
);
