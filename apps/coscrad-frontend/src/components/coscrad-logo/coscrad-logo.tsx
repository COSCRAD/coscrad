// We're importing this asset so that if it is not present it will break the build
import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export const COSCRADLogo = (): JSX.Element => {
    const { coscradLogoUrl } = useContext(ConfigurableContentContext);

    const imgStyle = {
        width: '100%',
        height: 'auto',
        display: 'block',
    };

    return (
        <Box sx={{ width: { xs: '80px', sm: '100px' }, height: 'auto' }}>
            <img style={imgStyle} src={coscradLogoUrl} alt="COSCRAD Logo" />
        </Box>
    );
};
