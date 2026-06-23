import { Box, CircularProgress, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export const Loading = (): JSX.Element => {
    const DEFAULT_LOADING_MESSAGE = 'Loading';

    const { loadingMessage } = useContext(ConfigurableContentContext);

    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

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
                <img
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                    width={40}
                    src={organizationLogoUrl}
                    alt="Logo"
                />
            </Box>

            <Typography variant={'inherit'} style={{ marginTop: '1rem' }}>
                {loadingMessage || DEFAULT_LOADING_MESSAGE}
            </Typography>
        </Box>
    );
};
