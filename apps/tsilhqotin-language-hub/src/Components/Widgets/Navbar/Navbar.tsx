import { Typography } from '@mui/material';
import React from 'react';
import Dropdown from './dropdown';
import { Nav, NavBtn, NavBtnLink, NavLink, NavMenu } from './NavbarElements';

const Navbar = () => {
    return (
        <Typography>
            <Nav>
                <NavLink style={{}} to="/">
                    <img
                        src={
                            'https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png'
                        }
                        alt="logo"
                        className="logo"
                        width={35}
                    />
                </NavLink>
                <input id="menu__toggle" type="checkbox" />

                <label className="menu__btn" htmlFor="menu__toggle" aria-hidden="true">
                    <span></span>
                </label>
                <ul className="menu__box">
                    <Dropdown />
                </ul>
                <NavMenu className="navLinks">
                    <NavLink to="/About">About</NavLink>
                    <NavLink to="/Apps">Apps</NavLink>
                    <NavLink to="/Songs">Songs</NavLink>
                    <NavLink to="/Videos">Videos</NavLink>
                    <NavLink to="/Teachers">Teachers</NavLink>
                    <NavLink to="/Funders">Funders</NavLink>
                    <NavLink to="/Greetings">Greetings</NavLink>
                    <NavLink to="/Links">Links</NavLink>
                    {/* Second Nav */}
                    {/* <NavBtnLink to='/sign-in'>Sign In</NavBtnLink> */}
                </NavMenu>
                <NavBtn>
                    <NavBtnLink className="hamburder-menu" to="/">
                        TDVB
                    </NavBtnLink>
                </NavBtn>
            </Nav>
        </Typography>
    );
};

export default Navbar;
