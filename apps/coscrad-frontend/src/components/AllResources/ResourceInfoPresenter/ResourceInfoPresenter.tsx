import { IAggregateInfo } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import './ResourceInfoPresenter.css';

export const ResourceInfoPresenter = ({
    type: resourceType,
    description,
    label,
    schema,
    link: apiIndexRoute,
}: IAggregateInfo): JSX.Element => {
    const resourceIndexLink =
        resourceType !== 'term' ? (
            <Link to="/ResourceIndex" state={{ schema, data: resourceType, link: apiIndexRoute }}>
                View Resources of type {label}
            </Link>
        ) : (
            <Link to="/Resources/Terms">View Terms</Link>
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
