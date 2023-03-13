import { Stack, styled, Typography } from '@mui/material';
import { COSCRADLogo } from '../coscrad-logo/coscrad-logo';

const Item = styled('div')(({ theme }) => ({
    textAlign: 'center',
    color: theme.palette.text.secondary,
}));

export const COSCRADByline = (): JSX.Element => {
    return (
        <Stack
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{
                mt: 2,
                width: '100%',
            }}
        >
            <Item>
                <Typography variant="smallest">A project built on the</Typography>
            </Item>
            <Item sx={{ mr: 1, ml: 1 }}>
                <COSCRADLogo />
            </Item>
            <Item>
                <Typography variant="smallest">platform.</Typography>
            </Item>
        </Stack>
    );
};
