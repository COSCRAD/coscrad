import { Auth0Provider } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { getConfig } from '../config';

const Auth0ProviderWithHistory = ({ children }) => {
    const { domain, clientId, audience } = getConfig();

    if (domain === null || typeof domain === 'undefined') {
        throw new Error(
            `failed to read domain from auth0 config, process.env: ${JSON.stringify(process.env)}`
        );
    }

    if (clientId === null || typeof clientId === 'undefined') {
        throw new Error('failed to read clientId from auth0 config');
    }

    const navigate = useNavigate();

    const onRedirectCallback = (appState) => {
        navigate(appState?.returnTo || window.location.pathname);
    };

    return (
        <Auth0Provider
            domain={domain}
            clientId={clientId}
            redirectUri={window.location.origin}
            onRedirectCallback={onRedirectCallback}
            audience={audience}
        >
            {children}
        </Auth0Provider>
    );
};

export default Auth0ProviderWithHistory;
