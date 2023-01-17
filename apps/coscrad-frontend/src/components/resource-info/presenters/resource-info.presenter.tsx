import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Card, CardActionArea, CardActions, CardContent, CardHeader } from '@mui/material';
import { Link } from 'react-router-dom';
import './resource-info.presenter.css';

export const ResourceInfoPresenter = ({
    description,
    label,
    route,
}: /**
 * TODO [https://www.pivotaltracker.com/story/show/183766033
 * We should expose the Schema as part of our own API docs somehow.
 */
IAggregateInfo<ResourceType> & { route: string }): JSX.Element => (
    <Link to={`/${route}`}>
        <Card>
            {/* TODO Handle pluralization properly as soon as we have a Resource Type whose plural form is irregular */}
            <CardHeader title={label} />
            <CardContent>
                <div className="resource-meta" data-testid={label}>
                    {description}
                </div>
            </CardContent>
            <CardActionArea>
                <CardActions></CardActions>
            </CardActionArea>
        </Card>
        <br />
    </Link>
);
