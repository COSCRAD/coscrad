import { Stack, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { Copyright } from '../copyright/copyright';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { TenantLogo } from '../tenant-logo/tenant-logo';

export const Footer = (): JSX.Element => {
    const { subTitle, copyrightHolder } = useContext(ConfigurableContentContext);

    return (
        <Box
            component="footer"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: '#ededed',
            }}
        >
            <Stack direction="row" spacing={2} justifyContent="space-between">
                <TenantLogo />
                <Box>
                    <Typography variant="h6">{subTitle}</Typography>
                </Box>
                <COSCRADByline />
            </Stack>
            <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
                <Copyright copyrightHolder={copyrightHolder} />
            </Stack>
        </Box>
    );
};
