import { ResourceType } from '@coscrad/api-interfaces';
import { SelectedResourceContainer } from '../../../../../components/higher-order-components/selected-resources.container';
import { thumbnailResourceDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-resource-detail-presenter-factory';
import { ConnectedResource } from '../../../notes/hooks';

type SelectedResourcesMap = Map<ResourceType, string[]>;

interface Props {
    data: ConnectedResource[];
}

/**
 * Strictly speaking, this is not a presenter. It is a nested container.
 * We rely on
 * - first fetching the resource
 * - then given the resource, fetching its connections
 * - for each connected resource type, fetching the given resources in the `SelectedResourcesContainer`
 */
export const ConnectedResourcesPanelPresenter = ({
    data: connectedResources,
}: Props): JSX.Element => {
    /**
     * We don't necessarily need to show resources of every resource type in
     * this panel. So we make sure to create selected resources views for only
     * the resource types we need, so not to needlessly trigger fetches. We
     * are lazy-loading resources here, on a "fetch all thefirst time the resource
     * type is seen" basis.
     */
    const relevantResourceTypesWithDuplicates = connectedResources.map(
        ({ compositeIdentifier: { type } }) => type
    );

    // Remove duplicates
    const uniqueResourceTypes = [...new Set(relevantResourceTypesWithDuplicates)];

    /**
     * We initialize an empty map so we don't have to clutter the reducer below
     * with the "set if not has" logic.
     */
    const emptyMap: SelectedResourcesMap = uniqueResourceTypes.reduce(
        (accMap, resourceType) => accMap.set(resourceType, []),
        new Map()
    );

    const resourceTypeToCompositeIds: SelectedResourcesMap = connectedResources.reduce(
        (acc: SelectedResourcesMap, { compositeIdentifier: { type: resourceType, id } }) =>
            acc.set(resourceType, [...acc.get(resourceType), id]),
        emptyMap
    );

    return (
        // TODO remove magic string
        <div data-testid={'connectedResourcesPanel'}>
            {uniqueResourceTypes.map((resourceType) => (
                /**
                 * Note taht the connected resources panel uses the thumbnail presenters.
                 * If later we'd like to support mobile, we should inject the
                 * correct factory here based on a config context.
                 */
                <SelectedResourceContainer
                    key={resourceType}
                    resourceType={resourceType}
                    selectedIds={resourceTypeToCompositeIds.get(resourceType)}
                    resourceDetailPresenterFactory={thumbnailResourceDetailPresenterFactory}
                />
            ))}
        </div>
    );
};
