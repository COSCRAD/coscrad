import { Stack, styled, Typography } from '@mui/material';
import Box from '@mui/material/Box';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { COSCRADByline } from '../coscrad-byline/coscrad-byline';
import { Tenant } from '../tenant/tenant';

const Item = styled('div')(({ theme }) => ({
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export const Footer = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { subTitle } = useContext(ConfigurableContentContext);

    return (
        <Stack
            component="footer"
            direction="column"
            sx={{
                py: 3,
                px: 2,
                mt: 'auto',
                backgroundColor: '#ededed',
            }}
        >
            <Item>
                <Box>
                    <Typography variant="small">{subTitle}</Typography>
                </Box>
            </Item>
            <Item>
                <Tenant />
            </Item>
            <Item>
                <COSCRADByline />
            </Item>
        </Stack>
    );
};
