import { ClassDataTypeMetadata } from '@coscrad/data-types';
import { Link } from 'react-router-dom';

/**
 * TODO Share this type with the backend.
 */
export type ResourceInfo = {
    type: string;

    description: string;

    label: string;

    schema: ClassDataTypeMetadata;

    link: string;
};

export default ({
    type: resourceType,
    description,
    label,
    schema,
    link,
}: ResourceInfo): JSX.Element => (
    <>
        <h1>
            {label} ({resourceType})
        </h1>

        <Link to="/ResourceIndex" state={{ schema, data: resourceType, link }}>
            CLICK ME HARDDDDDDD!
        </Link>

        <div>{description}</div>

        <h2>Schema:</h2>
        <div>{JSON.stringify(schema)}</div>

        <h2>Index API Endpoint:</h2>
        <div>{link}</div>
    </>
);
