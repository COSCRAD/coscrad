import { Box } from '@mui/material';
import { Copyright } from '../copyright/copyright';
import { TenantLogo } from './tenant-logo';

export const Tenant = (): JSX.Element => {
    return (
        <Box
            sx={{
                width: '80%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                margin: 'auto',
                mt: 2,
                gap: 2,
            }}
        >
            <TenantLogo />
            <Copyright />
        </Box>
    );
};
