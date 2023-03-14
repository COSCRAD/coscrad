import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { StyledImageInUILayout } from '../../utils/generic-components/presenters/styled-image-in-ui-layout';

export const COSCRADLogo = (): JSX.Element => {
    const { coscradLogoUrl } = useContext(ConfigurableContentContext);

    return (
        <StyledImageInUILayout sx={{ width: '100px' }} src={coscradLogoUrl} alt="COSCRAD Logo" />
    );
};
