import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export interface AboutProps {
    about: string;
}

export const Credits = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { siteCredits } = useContext(ConfigurableContentContext);

    return (
        <>
            <Typography variant="h2">Credits</Typography>
            <Typography variant="body1">{siteCredits}</Typography>
        </>
    );
};
