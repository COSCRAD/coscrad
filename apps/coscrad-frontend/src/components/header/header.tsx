import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { NavBar } from '../nav-bar/nav-bar';
import './header.css';

export const Header = (): JSX.Element => {
    const { siteTitle, subTitle } = useContext(ConfigurableContentContext);

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
};
