import React from 'react';
import { Bars, Nav, NavBtn, NavBtnLink, NavLink, NavMenu } from './NavbarElements';

const Navbar = () => {
    return (
        <Nav>
            <NavLink to="/">
                <img
                    src={
                        'https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png'
                    }
                    alt="logo"
                    width={35}
                />
            </NavLink>
            <Bars />
            <NavMenu>
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
                <NavBtnLink to="/signin">TDVB</NavBtnLink>
            </NavBtn>
        </Nav>
    );
};

export default Navbar;
