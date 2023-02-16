import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export interface AboutProps {
    about: string;
}

export const About = (): JSX.Element => {
    const { about } = useContext(ConfigurableContentContext);

    return <Typography variant="body1">{about}</Typography>;
};
