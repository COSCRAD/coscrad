import { HttpStatusCode, ResourceType } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { IResourceDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { buildUseLoadableForSingleResourceType } from './buildUseLoadableResourcesOfSingleType';
import { SelectedResourcesPresenter } from './selected-resources.presenter';

interface SelectedResourceContainerProps<T> {
    resourceType: ResourceType;
    selectedIds: string[];
    resourceDetailPresenterFactory: IResourceDetailPresenterFactory<T>;
}

export const SelectedResourceContainer = ({
    resourceType,
    selectedIds,
    resourceDetailPresenterFactory,
}: SelectedResourceContainerProps<unknown>): JSX.Element => {
    const useResources = buildUseLoadableForSingleResourceType(resourceType);

    const loadableResources = useResources();

    const { data: allResourcesOfGivenType } = loadableResources;

    if (allResourcesOfGivenType) {
        const searchResults = selectedIds.map(
            (idToFind) =>
                allResourcesOfGivenType.data.find(({ data: { id } }) => idToFind === id) ||
                NOT_FOUND
        );

        return (
            <SelectedResourcesPresenter
                viewModels={searchResults}
                presenterFactory={resourceDetailPresenterFactory}
                resourceType={resourceType}
            />
        );
    }
    if (loadableResources.errorInfo) return <ErrorDisplay {...loadableResources.errorInfo} />;

    if (loadableResources.isLoading) return <Loading />;

    // The need for this catch-all is a bit of a smell.
    return (
        <ErrorDisplay
            code={HttpStatusCode.internalError}
            message="Invalid selected resources query state"
        />
    );
};
