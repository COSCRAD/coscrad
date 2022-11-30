import { ResourceType } from '@coscrad/api-interfaces';
import { IResourceDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { SelectedResourceContainer } from './selected-resources.container';

type ResourceTypeAndSelectedIds = { [K in ResourceType]?: string[] };

interface ResourcesOfMultipleTypeContainerProps<T> {
    resourceTypeAndIds: ResourceTypeAndSelectedIds;
    resourceDetailPresenterFactory: IResourceDetailPresenterFactory<T>;
    heading?: string;
}

export const ResourcesOfMultipleTypeContainer = <T,>({
    resourceTypeAndIds,
    resourceDetailPresenterFactory,
    heading,
}: ResourcesOfMultipleTypeContainerProps<T>): JSX.Element => (
    <div>
        <h3>{heading || 'Selected Resources'}</h3>
        {Object.entries(resourceTypeAndIds).map(
            ([resourceType, selectedIds]: [ResourceType, string[]]) => (
                <SelectedResourceContainer
                    resourceType={resourceType}
                    resourceDetailPresenterFactory={resourceDetailPresenterFactory}
                    selectedIds={selectedIds}
                />
            )
        )}
    </div>
);
