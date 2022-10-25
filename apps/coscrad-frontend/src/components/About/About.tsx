import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import './About.module.scss';

export interface AboutProps {
    about: string;
}

export function About() {
    const { about } = useContext(ConfigurableContentContext);

    return <div>{about}</div>;
}

export default About;
