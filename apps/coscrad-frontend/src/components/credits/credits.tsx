import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { CoscradPrimaryStyleLayoutContainer } from '../../utils/generic-components/style-components/coscrad-main-content-container';

export interface AboutProps {
    about: string;
}

export const Credits = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { siteCredits } = useContext(ConfigurableContentContext);

    return (
        <CoscradPrimaryStyleLayoutContainer>
            <Typography variant="h2">Credits</Typography>
            <Typography variant="body1">{siteCredits}</Typography>
        </CoscradPrimaryStyleLayoutContainer>
    );
};
