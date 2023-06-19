import { IconButton } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImage } from '../../utils/generic-components/presenters/styled-image';

export const TenantLogo = (): JSX.Element => {
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        //TODO parent organization url here
        <IconButton>
            <StyledImage
                sx={{ width: { xs: '30px', sm: '35px', md: '40px' } }}
                src={organizationLogoUrl}
                alt="COSCRAD Logo"
            />
        </IconButton>
    );
};
