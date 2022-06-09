import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

// @ts-expect-error
const Auth0ProviderWithHistory = ({ children }) => {
    const domain = process.env['REACT_APP_AUTH0_DOMAIN'];
    const clientId = process.env['REACT_APP_AUTH0_CLIENT_ID'];

    console.log({
        process: process.env,
    });

    if (domain === null || typeof domain === 'undefined') {
        throw new Error(
            `failed to read domain from auth0 config, process.env: ${JSON.stringify(process.env)}`
        );
    }

    if (clientId === null || typeof clientId === 'undefined') {
        throw new Error('failed to read clientId from auth0 config');
    }

    const navigate = useNavigate();

    // @ts-expect-error
    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
            onRedirectCallback={onRedirectCallback}
        >
            {children}
        </Auth0Provider>
    );
};

export default Auth0ProviderWithHistory;
