import { ResourceCompositeIdentifier } from '@coscrad/api-interfaces';
import { SelectedCategorizablesOfMultipleTypesPresenter } from '../../../../../components/higher-order-components/selected-categorizables-of-multiple-types.presenter';
import { useLoadableCategorizables } from '../../../../../components/higher-order-components/use-loadable-categorizables';
import { thumbnailCategorizableDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { useLoadableConnectionsToResource } from '../../../notes/hooks';

export interface ConnectedResourcesPanelProps {
    compositeIdentifier: ResourceCompositeIdentifier;
}

// TODO Refactor this to use the new `CategorizablesOfMultipleTypesPresenter` and custom hook
export const ConnectedResourcesPanel = ({
    compositeIdentifier,
}: ConnectedResourcesPanelProps): JSX.Element => {
    const loadableConnections = useLoadableConnectionsToResource(compositeIdentifier);

    const { data: connections } = loadableConnections;

    console.log({ connections });

    const compositeIdentifiers =
        connections?.map(({ compositeIdentifier }) => compositeIdentifier) || [];

    const loadableConnectedResources = useLoadableCategorizables(compositeIdentifiers);

    return SelectedCategorizablesOfMultipleTypesPresenter({
        viewModelSnapshot: loadableConnectedResources,
        presenterFactory: thumbnailCategorizableDetailPresenterFactory,
        // TODO Deal with this properly
        getPluralLabelForCategorizableType: (categorizableType) => `${categorizableType}s`,
    });
};
