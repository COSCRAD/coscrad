import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { SelectedCategorizablesOfMultipleTypesPresenter } from '../../../../../components/higher-order-components/selected-categorizables-of-multiple-types.presenter';
import { useLoadableCategorizables } from '../../../../../components/higher-order-components/use-loadable-categorizables';
import { thumbnailCategorizableDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { useLoadableConnectionsToResource } from '../../../notes/hooks';

export interface ConnectedResourcesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

export const ConnectedResourcesPanel = ({
    compositeIdentifier,
}: ConnectedResourcesPanelProps): JSX.Element => {
    const loadableConnections = useLoadableConnectionsToResource(compositeIdentifier);

    const { data: connections } = loadableConnections;

    const compositeIdentifiers =
        connections?.map(({ compositeIdentifier }) => compositeIdentifier) || [];

    const loadableConnectedResources = useLoadableCategorizables(compositeIdentifiers);

    const notesById =
        connections?.map(({ compositeIdentifier: { id }, text }) => ({
            connectionId: id,
            connectionNote: text,
        })) || [];

    if (compositeIdentifiers.length === 0) return <>No Connections Found</>;

    return SelectedCategorizablesOfMultipleTypesPresenter({
        viewModelSnapshot: loadableConnectedResources,
        notesByCompositeId: notesById,
        presenterFactory: thumbnailCategorizableDetailPresenterFactory,
    });
};
