import { ResourceType } from '@coscrad/api-interfaces';
import { ConnectedResourcesPanel } from '../../store/slices/resources/shared/connected-resources/connected-resources-panel';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { fullViewResourcePresenterFactory } from '../resources/factories/full-view-resource-presenter-factory';
import { AggregateDetailContainer } from './aggregate-detail-container';

export const AggregatePage = (resourceType: ResourceType): JSX.Element => {
    const id = useIdFromLocation();

    const compositeIdentifier = { type: resourceType, id };

    return (
        <div>
            <AggregateDetailContainer
                compositeIdentifier={compositeIdentifier}
                detailPresenterFactory={fullViewResourcePresenterFactory}
            />
            <ConnectedResourcesPanel compositeIdentifier={compositeIdentifier} />
        </div>
    );
};
