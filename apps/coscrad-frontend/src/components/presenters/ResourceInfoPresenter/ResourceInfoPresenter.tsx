import { ClassSchema } from '@coscrad/data-types';
import { Link } from 'react-router-dom';
import './ResourceInfoPresenter.css';

/**
 * TODO Share this type with the backend.
 */
export type ResourceInfo = {
    type: string;

    description: string;

    label: string;

    schema: ClassSchema;

    link: string;
};

export default ({
    type: resourceType,
    description,
    label,
    schema,
    link: apiIndexRoute,
}: ResourceInfo): JSX.Element => (
    <>
        <h3>
            {label} ({resourceType})
        </h3>

        <div className="resource-meta">
            <Link to="/ResourceIndex" state={{ schema, data: resourceType, link: apiIndexRoute }}>
                View Resources of type {label}
            </Link>

            <div>{description}</div>
        </div>
    </>
);
