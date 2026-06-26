import { Box, CircularProgress, Typography } from '@mui/material';

export const Loading = (): JSX.Element => {
    const DEFAULT_LOADING_MESSAGE = 'Loading';

    const loadingMessage = 'Loading COSCRAD...';

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '3em 0 0 0',
            }}
            data-testid="loading"
        >
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
                <CircularProgress size={'6rem'} />
            </Box>

            <Typography variant={'inherit'} style={{ marginTop: '1rem' }}>
                {loadingMessage || DEFAULT_LOADING_MESSAGE}
            </Typography>
        </Box>
    );
};
