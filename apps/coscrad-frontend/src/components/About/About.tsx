import './About.module.scss';

export interface AboutProps {
    about: string;
}

export function About({ about }: AboutProps) {
    return <div>{about}</div>;
}

export default About;
