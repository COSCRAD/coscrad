import { useAuth0 } from '@auth0/auth0-react';
import { Login as LoginIcon } from '@mui/icons-material/';
import { IconButton, Tooltip } from '@mui/material';

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <Tooltip title="Log In">
            <IconButton data-testid="login-button" onClick={() => loginWithRedirect()}>
                <LoginIcon sx={{ color: 'white' }} />
            </IconButton>
        </Tooltip>
    );
};

export default LoginButton;
