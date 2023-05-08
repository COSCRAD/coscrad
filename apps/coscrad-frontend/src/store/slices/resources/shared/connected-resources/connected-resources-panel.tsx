import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
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

    if (compositeIdentifiers.length === 0)
        return (
            <>
                <Typography variant="h3">Connected Resources</Typography>
                No Connections Found
            </>
        );

    return SelectedCategorizablesOfMultipleTypesPresenter({
        viewModelSnapshot: loadableConnectedResources,
        presenterFactory: thumbnailCategorizableDetailPresenterFactory,
        // TODO Deal with this properly
        getPluralLabelForCategorizableType: (categorizableType) => `${categorizableType}s`,
    });
};
