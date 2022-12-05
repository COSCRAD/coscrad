import { ResourceType } from '@coscrad/api-interfaces';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { fullViewCategorizablePresenterFactory } from '../resources/factories/full-view-categorizable-presenter-factory';
import { AggregateDetailContainer } from './aggregate-detail-container';

/**
 * We may want to extends this to an `AggregatePage` some day, or at least
 * `CategorizablePage`. We aren't too concerned about that right now as our core
 * value is being extensbile to adding new resource typs and non-resource
 * aggregates are one-offs.
 *
 * We may want to put this in `/Components/Resources/Shared`.
 */
export const ResourcePage = (resourceType: ResourceType): JSX.Element => {
    const id = useIdFromLocation();

    const compositeIdentifier = { type: resourceType, id };

    return (
        <div>
            <AggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={fullViewCategorizablePresenterFactory}
            />
        </div>
    );
};
