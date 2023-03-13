import { Stack } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { Copyright } from '../copyright/copyright';
import { TenantLogo } from './tenant-logo';

export const Tenant = (): JSX.Element => {
    const { copyrightHolder } = useContext(ConfigurableContentContext);

    return (
        <Stack direction="row" justifyContent="center" alignItems="center" sx={{ mt: 2, gap: 1 }}>
            <TenantLogo />
            <Copyright copyrightHolder={copyrightHolder} />
        </Stack>
    );
};
