import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import './ResourceInfo.presenter.css';

export const ResourceInfoPresenter = ({
    type: resourceType,
    description,
    label,
}: /**
 * TODO [https://www.pivotaltracker.com/story/show/183766033
 * We should expose the Schema as part of our own API docs somehow.
 */
IAggregateInfo<ResourceType>): JSX.Element => {
    const resourceIndexLink = (
        <Link to={`/${routes.resources.ofType(resourceType).index}`}>View {label}s</Link>
    );

    return (
        <>
            <h3>
                {label} ({resourceType})
            </h3>

            <div className="resource-meta" data-testid={label}>
                {resourceIndexLink}

                <div>{description}</div>
            </div>
        </>
    );
};
