import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Link } from 'react-router-dom';
import { routes } from '../../../app/routes/routes';
import './ResourceInfo.presenter.css';

export const ResourceInfoPresenter = ({
    type: resourceType,
    description,
    label,
    schema,
    link: apiIndexRoute,
}: IAggregateInfo<ResourceType>): JSX.Element => {
    const resourceIndexLink = (
        [
            ResourceType.term,
            ResourceType.photograph,
            ResourceType.transcribedAudio,
            ResourceType.vocabularyList,
        ] as ResourceType[]
    ).includes(resourceType) ? (
        <Link to={`/${routes.resources.ofType(resourceType).index}`}>View {label}s</Link>
    ) : (
        <Link to="/ResourceIndex" state={{ schema, data: resourceType, link: apiIndexRoute }}>
            View Resources of type {label}
        </Link>
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
