import { Link } from 'react-router-dom';
import AuthenticationButton from '../AuthenticationButton/AuthenticationButton';
import './Home.module.scss';

export function Home() {
    return (
        <div>
            <h1>Welcome to coscrad</h1>
            <Link to="/About">About</Link>
            <Link to="/AllEntities">All Entities</Link>
            <Link to="/MembersOnly">Members Only</Link>

            <AuthenticationButton></AuthenticationButton>
        </div>
    );
}

export default Home;
