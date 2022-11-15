import { ResourceType } from '@coscrad/api-interfaces';
import { ConnectedResourcesPanel } from '../../../store/slices/resources/shared/connected-resources/connected-resources-panel';
import { useIdFromLocation } from '../../../utils/custom-hooks/use-id-from-location';
import { fullViewResourceDetailContainerFactory } from '../factories/full-view-resource-detail-container-factory';

export const TermDetailContainer = (): JSX.Element => {
    const DetailView = fullViewResourceDetailContainerFactory(ResourceType.term);

    // TODO Avoid using this twice
    const id = useIdFromLocation();

    return (
        <div>
            <DetailView />
            <ConnectedResourcesPanel compositeIdentifier={{ type: ResourceType.term, id }} />
        </div>
    );
};
