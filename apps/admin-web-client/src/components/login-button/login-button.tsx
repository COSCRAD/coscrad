import { useAuth0 } from '@auth0/auth0-react';
import LoginIcon from '@mui/icons-material/Login';
import { IconButton, Tooltip } from '@mui/material';

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <Tooltip title="Log In">
            <IconButton
                data-testid="login-button"
                color="secondary"
                onClick={() => loginWithRedirect()}
            >
                <LoginIcon />
            </IconButton>
        </Tooltip>
    );
};

export default LoginButton;
