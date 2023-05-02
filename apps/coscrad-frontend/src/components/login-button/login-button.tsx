import { useAuth0 } from '@auth0/auth0-react';
import LoginIcon from '@mui/icons-material/Login';
import { IconButton } from '@mui/material';

const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    return (
        <IconButton color="secondary" onClick={() => loginWithRedirect()}>
            <LoginIcon />
        </IconButton>
    );
};

export default LoginButton;
