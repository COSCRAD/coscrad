import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImage } from '../../utils/generic-components/presenters/styled-image';

export const TenantLogo = (): JSX.Element => {
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <StyledImage
            sx={{ width: { xs: '40px', sm: '55px', md: '61px' } }}
            src={organizationLogoUrl}
            alt="COSCRAD Logo"
        />
    );
};
