import { Box } from '@mui/material';
import AuthenticationButton from '../authentication-button/authentication-button';

export const NavMenuPresenter = (): JSX.Element => {
    return (
        <Box columnGap={1} sx={{ display: 'flex', alignItems: 'center' }}>
            <AuthenticationButton />
        </Box>
    );
};
