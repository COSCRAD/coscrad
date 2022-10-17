import { ConfigurableContent } from '../../configurable-front-matter/data/configSchema';
import './Home.module.scss';

export interface HomeProps {
    frontMatter: ConfigurableContent;
}

export function Home({ frontMatter }: HomeProps) {
    return <div>{frontMatter.siteDescription}</div>;
}

export default Home;
