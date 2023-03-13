import { Box } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export const TenantLogo = (): JSX.Element => {
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    const imgStyle = {
        width: '100%',
        height: 'auto',
        display: 'block',
    };

    return (
        <Box sx={{ width: { xs: '40px', sm: '50px', md: '61px' }, height: 'auto' }}>
            <img style={imgStyle} src={organizationLogoUrl} alt="organization logo" />
        </Box>
    );
};
