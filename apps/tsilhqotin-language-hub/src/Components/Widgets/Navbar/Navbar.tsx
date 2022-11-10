import { Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Dropdown from './dropdown';
import { Nav, NavBtn, NavBtnLink, NavLink, NavMenu } from './NavbarElements';

const Navbar = () => {
    return (
        <div>
            <Link to="/Contact" className="topNav">
                Tŝilhqot’in Language Hub | (778) 412-1112
            </Link>

            <Nav>
                <NavLink style={{ color: 'black' }} to="/">
                    <img
                        src="https://www.tsilhqotin.ca/wp-content/uploads/2022/11/tsilhqotin_language_logo_final.png"
                        alt="logo"
                        className="logo"
                        width={60}
                    />
                </NavLink>
                <input id="menu__toggle" type="checkbox" />

                <label className="menu__btn" htmlFor="menu__toggle" aria-hidden="true">
                    <span></span>
                </label>
                <ul className="menu__box">
                    <Dropdown />
                </ul>
                <Typography component={'span'} sx={{ margin: '15px', padding: '15px' }}>
                    <NavMenu className="navLinks">
                        <NavLink to="/About">About</NavLink>
                        <NavLink id="radioNav" to="/Radio">
                            104.5 FM
                        </NavLink>
                        <NavLink to="/Apps">Apps</NavLink>
                        <NavLink to="/Songs">Songs</NavLink>
                        <NavLink to="/Videos">Videos</NavLink>
                        <NavLink to="/Teachers">Teachers</NavLink>
                        <NavLink to="/Funders">Funders</NavLink>
                        <NavLink to="/Links">Links</NavLink>
                        <NavLink to="/Contact">Contact</NavLink>
                        {/* Second Nav */}
                        {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
                    </NavMenu>
                </Typography>
                <NavBtn>
                    <NavBtnLink className="hamburder-menu"></NavBtnLink>
                </NavBtn>
            </Nav>
        </div>
    );
};

export default Navbar;
