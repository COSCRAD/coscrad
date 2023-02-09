import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';

export interface AboutProps {
    about: string;
}

export const Credits = (): JSX.Element => {
    const { siteCredits } = useContext(ConfigurableContentContext);

    return <div>{siteCredits}</div>;
};
