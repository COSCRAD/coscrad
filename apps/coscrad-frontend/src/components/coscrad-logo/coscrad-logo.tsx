import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImage } from '../../utils/generic-components/presenters/styled-image';

export const COSCRADLogo = (): JSX.Element => {
    const { coscradLogoUrl } = useContext(ConfigurableContentContext);

    return <StyledImage sx={{ width: '100px' }} src={coscradLogoUrl} alt="COSCRAD Logo" />;
};
