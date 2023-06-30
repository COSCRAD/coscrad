import { Grid, Typography } from '@mui/material';
import { COSCRADLogo } from '../coscrad-logo/coscrad-logo';

export const COSCRADByline = (): JSX.Element => {
    return (
        <Grid
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            sx={{
                width: '100%',
            }}
        >
            <Grid item>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    A project built on the
                </Typography>
            </Grid>
            <Grid item sx={{ mr: 1, ml: 1 }}>
                <COSCRADLogo />
            </Grid>
            <Grid item>
                <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
                    platform.
                </Typography>
            </Grid>
        </Grid>
    );
};
