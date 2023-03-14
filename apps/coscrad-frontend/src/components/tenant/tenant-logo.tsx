import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImageInUILayout } from '../../utils/generic-components/presenters/styled-image-in-ui-layout';

export const TenantLogo = (): JSX.Element => {
    const { organizationLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <StyledImageInUILayout
            sx={{ width: { xs: '40px', sm: '55px', md: '61px' } }}
            src={organizationLogoUrl}
            alt="COSCRAD Logo"
        />
    );
};
