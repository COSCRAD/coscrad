import { ResourceType } from '@coscrad/api-interfaces';
import { SelectedCategorizablesOfSingleTypeContainer } from '../../../../../components/higher-order-components/selected-categorizables-of-single-type.container';
import { thumbnailCategorizableDetailPresenterFactory } from '../../../../../components/resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { ConnectedResource } from '../../../notes/hooks';
import { buildPluralLabelsMapForCategorizableTypes } from './build-plural-labels-map-for-categorizable-types';

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
     * We only need to show the resource types that are connected to the resource
     * of focus (the one whose detail page we are in) here. So we make sure to
     * create selected resources views for only the resource types we need, so
     * not to needlessly trigger fetches. We are lazy-loading resources here,
     * on a "fetch all the first time the resource type is seen" basis.
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
        <div data-testid={'connectedResourcesPanel'}>
            <h2>Connected Resources</h2>
            {uniqueResourceTypes.map((resourceType) => (
                /**
                 * Note that the connected resources panel uses the thumbnail presenters.
                 * If later we'd like to support mobile, we should inject the
                 * correct thumbnail detail presenter factory here based on a config context.
                 */
                <SelectedCategorizablesOfSingleTypeContainer
                    key={resourceType}
                    categorizableType={resourceType}
                    selectedIds={resourceTypeToCompositeIds.get(resourceType)}
                    detailPresenterFactory={thumbnailCategorizableDetailPresenterFactory}
                    pluralLabelForCategorizableType={buildPluralLabelsMapForCategorizableTypes().get(
                        resourceType
                    )}
                />
            ))}
        </div>
    );
};
