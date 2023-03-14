import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { Copyright } from '../copyright/copyright';
import { TenantLogo } from './tenant-logo';

export const Tenant = (): JSX.Element => {
    const { copyrightHolder } = useContext(ConfigurableContentContext);

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
            <Copyright copyrightHolder={copyrightHolder} />
        </Box>
    );
};
