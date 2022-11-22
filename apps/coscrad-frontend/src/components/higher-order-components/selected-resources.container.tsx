import { IBaseViewModel, IDetailQueryResult, ResourceType } from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { IResourceDetailPresenterFactory } from '../resources/factories/resource-detail-presenter-factory.interface';
import { buildUseLoadableForSingleResourceType } from './buildUseLoadableResourcesOfSingleType';
import { displayLoadableWithErrorsAndLoading } from './displayLoadableWithErrorsAndLoading';
import { SelectedResourcesPresenter } from './selected-resources.presenter';

interface SelectedResourceContainerProps<T> {
    resourceType: ResourceType;
    selectedIds: string[];
    resourceDetailPresenterFactory: IResourceDetailPresenterFactory<T>;
}

type SearchResult = NOT_FOUND | IDetailQueryResult<IBaseViewModel>;

export const SelectedResourceContainer = ({
    resourceType,
    selectedIds,
    resourceDetailPresenterFactory,
}: SelectedResourceContainerProps<unknown>): JSX.Element => {
    const useResources = buildUseLoadableForSingleResourceType(resourceType);

    const loadableResources = useResources();

    const { data: allResourcesOfGivenType, isLoading, errorInfo } = loadableResources;

    /**
     * Maybe we should abstract the search behind the custom hook as well. Since this
     * is already a signle source of truth, reusable container, I am not too worried
     * about that.
     */
    const loadableSearchResult: ILoadable<SearchResult[]> = {
        isLoading,
        errorInfo,
        data:
            allResourcesOfGivenType &&
            selectedIds.map(
                (idToFind) =>
                    allResourcesOfGivenType.data.find(({ data: { id } }) => idToFind === id) ||
                    NOT_FOUND
            ),
    };

    const Presenter = displayLoadableWithErrorsAndLoading(
        SelectedResourcesPresenter,
        (loadedData: SearchResult[]) => ({
            viewModels: loadedData,
            presenterFactory: resourceDetailPresenterFactory,
            resourceType,
        })
    );

    return <Presenter {...loadableSearchResult} />;
};
