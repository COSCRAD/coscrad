import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Card, CardActionArea, CardActions, CardContent, CardHeader } from '@mui/material';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import './resource-info.presenter.css';

export const ResourceInfoPresenter = ({
    type: resourceType,
    description,
    label,
}: /**
 * TODO [https://www.pivotaltracker.com/story/show/183766033
 * We should expose the Schema as part of our own API docs somehow.
 */
IAggregateInfo<ResourceType>): JSX.Element => (
    <Link to={`/${routes.resources.ofType(resourceType).index}`}>
        <Card>
            {/* TODO Handle pluralization properly as soon as we have a Resource Type whose plural form is irregular */}
            <CardHeader title={`${label}s`} />
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
