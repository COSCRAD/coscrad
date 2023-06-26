import { useAuth0 } from '@auth0/auth0-react';
import LogoutIcon from '@mui/icons-material/Logout';
import { IconButton, Tooltip } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { userLoggedOut } from '../../store/slices/auth';

const LogoutButton = () => {
    const { logout } = useAuth0();

    const dispatch = useAppDispatch();

    return (
        <Tooltip title="Log Out">
            <IconButton
                data-testid="logout-button"
                color="secondary"
                onClick={() => {
                    dispatch(userLoggedOut());

                    return logout({
                        returnTo: window.location.origin,
                    });
                }}
            >
                <LogoutIcon />
            </IconButton>
        </Tooltip>
    );
};

export default LogoutButton;
