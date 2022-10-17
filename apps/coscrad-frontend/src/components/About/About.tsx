import { ConfigurableContent } from '../../configurable-front-matter/data/configSchema';
import './About.module.scss';

export interface AboutProps {
    frontMatter: ConfigurableContent;
}

export function About({ frontMatter }: AboutProps) {
    return <div>{frontMatter.about}</div>;
}

export default About;
