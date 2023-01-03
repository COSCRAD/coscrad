import { useAuth0 } from '@auth0/auth0-react';
import { useAppDispatch } from '../../app/hooks';
import { userLoggedOut } from '../../store/slices/auth';

const LogoutButton = () => {
    const { logout } = useAuth0();

    const dispatch = useAppDispatch();

    return (
        <button
            className="btn btn-danger btn-block"
            onClick={() => {
                dispatch(userLoggedOut());

                return logout({
                    returnTo: window.location.origin,
                });
            }}
        >
            Log Out
        </button>
    );
};

export default LogoutButton;
