import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import './Home.module.scss';

export function Home() {
    const { siteDescription } = useContext(ConfigurableContentContext);

    return <div>{siteDescription}</div>;
}

export default Home;
