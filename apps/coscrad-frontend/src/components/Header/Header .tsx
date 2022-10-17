import { Link } from 'react-router-dom';
import { ConfigurableContent } from '../../configurable-front-matter/data/configSchema';
import { NavBar } from '../NavBar/NavBar';
import './Header.css';

export interface HeaderProps {
    frontMatter: ConfigurableContent;
}

export function Header({ frontMatter }: HeaderProps) {
    return (
        <header>
            <h1>
                <Link to="/">{frontMatter.siteTitle}</Link>
            </h1>
            <h2>{frontMatter.subTitle}</h2>
            <nav>
                <NavBar></NavBar>
            </nav>
        </header>
    );
}

export default Header;
