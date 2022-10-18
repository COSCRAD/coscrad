import { Link } from 'react-router-dom';
import AuthenticationButton from '../AuthenticationButton/AuthenticationButton';
import './NavBar.css';

export function NavBar() {
    return (
        <ul>
            <li>
                <Link to="/">Home</Link>
            </li>
            <li>
                <Link to="/About">About</Link>
            </li>
            <li>
                <Link to="/AllResources">Browse Resources</Link>
            </li>
            <li>
                <Link to="/MembersOnly">Members Only</Link>
            </li>
            <li>
                <AuthenticationButton></AuthenticationButton>
            </li>
        </ul>
    );
}
