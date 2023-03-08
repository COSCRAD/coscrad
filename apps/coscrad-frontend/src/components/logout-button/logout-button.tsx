import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { resetApp } from '../../store';

const LogoutButton = () => {
    const { logout } = useAuth0();

    const dispatch = useAppDispatch();

    return (
        <IconButton
            color="primary"
            onClick={() => {
                dispatch(resetApp());

                return logout({
                    returnTo: window.location.origin,
                });
            }}
        >
            <LogoutIcon />
        </IconButton>
    );
};

export default LogoutButton;
