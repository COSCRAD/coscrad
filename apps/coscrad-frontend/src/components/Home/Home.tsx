import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import './Home.module.scss';

export const Home = (): JSX.Element => {
    const { siteDescription, siteHomeImageUrl } = useContext(ConfigurableContentContext);

    return (
        <div>
            <img src={siteHomeImageUrl} /> {siteDescription}
        </div>
    );
};
