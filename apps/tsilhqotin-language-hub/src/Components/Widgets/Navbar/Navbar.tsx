import { Typography } from '@mui/material';
import Dropdown from './dropdown';
import { Nav, NavBtn, NavBtnLink, NavLink, NavMenu } from './NavbarElements';

const Navbar = () => {
    return (
        <Nav>
            <NavLink to="/">
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
            <Typography component={'span'} sx={{ margin: '15px', padding: '15px' }}>
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
            </Typography>
            <NavBtn>
                <NavBtnLink className="hamburder-menu">
                    <a
                        href="https://play.google.com/store/apps/developer?id=Aaron+Plahn+%28Ts%CC%82ilhqot%E2%80%99in+National+Government%29"
                        target={'noreferrer'}
                    >
                        <img
                            src="https://www.tsilhqotin.ca/wp-content/uploads/2022/05/playstore.png"
                            alt="playstore"
                            width={40}
                        />
                    </a>
                </NavBtnLink>
            </NavBtn>
        </Nav>
    );
};

export default Navbar;
