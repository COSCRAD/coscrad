import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export interface AboutProps {
    about: string;
}

export const About = (): JSX.Element => {
    /**
     * TODO: Move data (ConfigurableContentContext) out of presenter
     */
    const { about } = useContext(ConfigurableContentContext);

    return (
        <>
            <Typography variant="h2">About</Typography>
            <Typography variant="body1">{about}</Typography>
        </>
    );
};
