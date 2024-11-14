import { Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { ExternalLink } from '../../configurable-front-matter/data/configurable-content-schema';
import { FunctionalComponent } from '../../utils/types/functional-component';

const LinkPresenter = ({ title, url, description }: ExternalLink) => {
    return (
        <div>
            <a href={url} target="_blank" rel="noreferrer">
                {title}
            </a>
            <Typography variant="body1">{description}</Typography>
        </div>
    );
};

export const Links: FunctionalComponent = () => {
    const { externalLinks } = useContext(ConfigurableContentContext);

    // TODO return null if there are no links and test this case
    return <>{externalLinks.map(LinkPresenter)}</>;
};
