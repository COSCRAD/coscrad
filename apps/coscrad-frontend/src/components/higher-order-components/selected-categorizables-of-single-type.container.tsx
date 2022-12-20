import {
    CategorizableType,
    IBaseViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { ILoadable } from '../../store/slices/interfaces/loadable.interface';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { ICategorizableDetailPresenterFactory } from '../resources/factories/categorizable-detail-presenter-factory.interface';
import { buildUseLoadableForSingleCategorizableType } from './buildUseLoadableResourcesOfSingleType';
import { displayLoadableWithErrorsAndLoading } from './display-loadable-with-errors-and-loading';
import { SelectedCategorizablesPresenter } from './selected-categorizables.presenter';

interface SelectedResourceContainerProps<T> {
    categorizableType: CategorizableType;
    selectedIds: string[];
    detailPresenterFactory: ICategorizableDetailPresenterFactory<T>;
    pluralLabelForCategorizableType: string;
}

type SearchResult = NOT_FOUND | ICategorizableDetailQueryResult<IBaseViewModel>;

export const SelectedCategorizablesOfSingleTypeContainer = ({
    categorizableType,
    selectedIds,
    detailPresenterFactory,
    pluralLabelForCategorizableType,
}: SelectedResourceContainerProps<unknown>): JSX.Element => {
    const useResources = buildUseLoadableForSingleCategorizableType(categorizableType);

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
                    allResourcesOfGivenType.entities.find(({ id }) => idToFind === id) || NOT_FOUND
            ),
    };

    const Presenter = displayLoadableWithErrorsAndLoading(
        SelectedCategorizablesPresenter,
        (loadedData: SearchResult[]) => ({
            viewModels: loadedData,
            presenterFactory: detailPresenterFactory,
            categorizableType,
            pluralLabelForCategorizableType,
        })
    );

    return <Presenter {...loadableSearchResult} />;
};
