import { Typography } from '@mui/material';
import './Navbar.module.css';

export default function Navbar() {
    return (
        <Typography>
            <nav className="navbar">
                <a className="navTitle" href="/">
                    <img
                        alt="logo"
                        className="tool"
                        src="https://api.tsilhqotinlanguage.ca/uploads/tng_log_for_language_hub_2e4ec30f17.png"
                        height={40}
                    ></img>
                    Tŝilhqot’in Language
                </a>
                <div style={{ padding: '10px' }}>
                    <a href="/About">About</a>
                    <a href="/Apps">Apps</a>
                    <a href="/Songs">Songs</a>
                    <a href="/Videos">Videos</a>
                    <a href="/Teachers">Teachers</a>
                    <a href="/Funders">Funders</a>
                    <a href="/Greetings">Greetings</a>
                    <a href="/Links">Links</a>
                </div>
            </nav>
        </Typography>
    );
}
