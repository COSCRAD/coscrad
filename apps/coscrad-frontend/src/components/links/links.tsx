import LaunchIcon from '@mui/icons-material/Launch';
import { Card, Link, Typography } from '@mui/material';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../configurable-front-matter/configurable-content-provider';
import { ExternalLink } from '../../configurable-front-matter/data/configurable-content-schema';
import { FunctionalComponent } from '../../utils/types/functional-component';

const LinkPresenter = ({ title, url, description }: ExternalLink) => {
    return (
        <Card key={url} sx={{ p: 2, mb: 2 }}>
            <Typography mb={0.5} variant="h3">
                {title}
            </Typography>
            <Typography variant="body1">{description}</Typography>
            <Typography
                component={Link}
                href={url}
                target="_blank"
                rel="noreferrer"
                sx={{ textDecoration: 'none' }}
            >
                Visit <LaunchIcon sx={{ verticalAlign: 'middle' }} />
            </Typography>
        </Card>
    );
};

export const Links: FunctionalComponent = () => {
    const { externalLinks } = useContext(ConfigurableContentContext);

    // TODO return null if there are no links and test this case
    return <>{externalLinks.map(LinkPresenter)}</>;
};
