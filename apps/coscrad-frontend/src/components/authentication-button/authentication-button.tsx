import { useAuth0 } from '@auth0/auth0-react';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import LoginButton from '../login-button/login-button';
import LogoutButton from '../logout-button/logout-button';

const AuthenticationButton = () => {
    const { isAuthenticated } = useAuth0();

    const { shouldEnableAdminMode } = useContext(ConfigurableContentContext);

    if (!shouldEnableAdminMode) return null;
    return isAuthenticated ? <LogoutButton /> : <LoginButton />;
};

export default AuthenticationButton;
