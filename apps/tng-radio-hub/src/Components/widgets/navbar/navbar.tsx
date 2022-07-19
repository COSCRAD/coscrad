import { Link } from 'react-router-dom';
import './navbar.module.css';

/* eslint-disable-next-line */
export interface NavbarProps {}

export function Navbar(props: NavbarProps) {
    return (
        <div>
            <Link to={"/"}>home</Link>
            <Link to={"/about"}>about</Link>
            <Link to={"/stream"}>stream</Link>
            <Link to={"/links"}>links</Link>
            <Link to={"/Contact"}>contact</Link>
            <Link to={"/funders"}>funders</Link>
        </div>
    );
}

export default Navbar;
