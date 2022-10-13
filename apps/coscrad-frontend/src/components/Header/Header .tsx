import { Link } from 'react-router-dom';
import FrontMatter from '../../configurable-front-matter/frontMatterData/FrontMatter';
import { NavBar } from '../NavBar/NavBar';
import './Header.css';

export interface HeaderProps {
    frontMatter: FrontMatter;
}

export function Header({ frontMatter }: HeaderProps) {
    return (
        <header>
            <h1>
                <Link to="/">{frontMatter.siteTitle}</Link>
            </h1>
            <h2>
                {frontMatter.subTitle}
            </h2>
            <nav>
                <NavBar></NavBar>
            </nav>
        </header>
    )
}

export default Header;