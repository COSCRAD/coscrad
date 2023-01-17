import { ResourceType } from '@coscrad/api-interfaces';
import { RootState } from '../../store';
import { fetchResourceInfos } from '../../store/slices/resource-info-slice';
import { useLoadable } from '../../store/slices/resources/shared/hooks';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { ResourceInfosPresenter } from './presenters';

// `/${routes.resources.ofType(resourceType).index}`

export type ResourceTypesAndLabels = { [K in ResourceType]?: string };

export type ResourceTypesAndRoutes = { [K in ResourceType]?: string };

export interface ResourceInfoContainerProps {
    resourceTypesAndLabels: ResourceTypesAndLabels;
    resourceTypesAndRoutes: ResourceTypesAndRoutes;
}

export function ResourceInfoContainer({
    resourceTypesAndLabels,
    resourceTypesAndRoutes,
}: ResourceInfoContainerProps): JSX.Element {
    const loadableResourceInfos = useLoadable({
        selector: (state: RootState) => state.resourceInfo,
        fetchThunk: fetchResourceInfos,
    });

    const LoadableResourceInfoPresenter = displayLoadableWithErrorsAndLoading(
        ResourceInfosPresenter,
        (data) => ({
            data,
            resourceTypesAndLabels,
            resourceTypesAndRoutes,
        })
    );

    return <LoadableResourceInfoPresenter {...loadableResourceInfos} />;
}
