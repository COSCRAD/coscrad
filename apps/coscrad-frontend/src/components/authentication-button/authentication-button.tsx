import { useAuth0 } from '@auth0/auth0-react';
import LoginButton from '../login-button/login-button';
import LogoutButton from '../logout-button/logout-button';

const AuthenticationButton = () => {
    const { isAuthenticated } = useAuth0();

    return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};

export default AuthenticationButton;
