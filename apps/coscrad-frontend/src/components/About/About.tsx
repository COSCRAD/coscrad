import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import './About.module.scss';

export interface AboutProps {
    about: string;
}

export const About = (): JSX.Element => {
    const { about } = useContext(ConfigurableContentContext);

    return <div>{about}</div>;
};
