import { Typography } from '@mui/material';
import { useAuthenticatedUserId } from '../../store/slices/auth';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';

export const CurrentUserInfo = (): JSX.Element => {
    const userId = useAuthenticatedUserId();

    /**
     * We do not want to render anything to the status bar if there is no authenticated
     * user.
     */
    if (userId === NOT_FOUND) return null;

    return <Typography variant="body1">Currently Logged In</Typography>;
};
