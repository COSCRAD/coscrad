import { ResourceType } from '../../../../../libs/api-interfaces/src';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { fullViewResourcePresenterFactory } from '../resources/factories/full-view-resource-presenter-factory';
import { AggregateDetailContainer } from './aggregate-detail-container';

export const AggregatePage = (resourceType: ResourceType): JSX.Element => {
    const id = useIdFromLocation();

    return (
        <div>
            <AggregateDetailContainer
                compositeIdentifier={{ type: resourceType, id }}
                detailPresenterFactory={fullViewResourcePresenterFactory}
            />
        </div>
    );
};
