import FrontMatter from '../../configurable-front-matter/frontMatterData/FrontMatter';
import './Home.module.scss';

export interface HomeProps {
    frontMatter: FrontMatter;
}

export function Home({ frontMatter }: HomeProps) {
    return (
        <div>
            {frontMatter.siteDescription}
        </div>
    );
}

export default Home;
