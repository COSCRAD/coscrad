import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchResourceInfos } from '../../store/slices/ResourcesSlice';
import AuthenticationButton from '../AuthenticationButton/AuthenticationButton';
import './Home.module.scss';

export function Home() {
    const dispatch = useDispatch();

    return (
        <div>
            <h1>Welcome to coscrad</h1>
            <Link to="/About">About</Link> |{' '}
            <Link to="/AllResources" onClick={() => dispatch<any>(fetchResourceInfos())}>
                Browse Resources
            </Link>{' '}
            |<Link to="/MembersOnly">Members Only</Link>
            <div>
                <AuthenticationButton></AuthenticationButton>
            </div>
        </div>
    );
}

export default Home;
