import FrontMatter from '../../configurable-front-matter/frontMatterData/FrontMatter';
import './About.module.scss';

export interface AboutProps {
    frontMatter: FrontMatter;
}

export function About({ frontMatter }: AboutProps) {
    return (
        <div>
            {frontMatter.about}
        </div>
    );
}

export default About;
