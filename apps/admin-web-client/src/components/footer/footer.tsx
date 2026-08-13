import { Box, Grid, Typography } from '@mui/material';

export const Footer = (): JSX.Element => {
    return (
        <Box
            component="footer"
            sx={{
                backgroundColor: '#ededed',
                position: 'relative',
                marginTop: 'auto',
                pl: 3,
                bottom: 0,
                left: 0,
                width: '100%',
                paddingBottom: '15px',
            }}
        >
            <Grid
                container
                direction="row"
                spacing={0}
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                }}
            >
                <Grid item xs={12} sm={3} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        Web Admin UX
                    </Typography>
                    <Typography variant="subtitle1">A cool site!</Typography>
                </Grid>
                <Grid item xs={12} sm={3} color="text.secondary"></Grid>
                <Grid item xs={12} sm={3} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        Contact
                    </Typography>
                    webadminUX@gmail.com
                </Grid>
                <Grid item xs={12} sm={3} color="text.secondary">
                    <Typography color="primary.main" variant="h3">
                        Links
                    </Typography>
                    <Typography variant="body1">Links here...</Typography>
                </Grid>
                <Grid item xs={12} sx={{ pt: 2 }} color="text.secondary">
                    <Typography variant="body1">Tenant here...</Typography>
                </Grid>
                <Grid item xs={12} color="text.secondary">
                    <Typography variant="body1">Great!!</Typography>
                </Grid>
            </Grid>
        </Box>
    );
};
