import { Link } from 'react-router-dom';
import { NavBar } from '../NavBar/NavBar';
import './Header.css';

export interface HeaderProps {
    siteTitle: string;
    subTitle: string;
}

export function Header({ siteTitle, subTitle }: HeaderProps) {
    return (
        <header>
            <h1>
                <Link to="/">{siteTitle}</Link>
            </h1>
            <h2>{subTitle}</h2>
            <nav>
                <NavBar></NavBar>
            </nav>
        </header>
    );
}

export default Header;
