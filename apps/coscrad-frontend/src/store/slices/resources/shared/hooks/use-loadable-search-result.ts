import { IBaseViewModel, IDetailQueryResult, IIndexQueryResult } from '@coscrad/api-interfaces';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { IMaybeLoadable, NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';

export const useLoadableSearchResult = <T extends IBaseViewModel>(
    useLoadableItems: () => ILoadable<IIndexQueryResult<T>>,
    idToFind: string
): IMaybeLoadable<IDetailQueryResult<T>> => {
    const loadableTranscribedAudioItems = useLoadableItems();

    const { data: allItems, isLoading, errorInfo } = loadableTranscribedAudioItems;

    if (isLoading || errorInfo !== null || allItems === null)
        return {
            isLoading,
            errorInfo,
            data: null,
        };

    const searchResult = allItems.data.find(({ data: { id } }) => id === idToFind) || NOT_FOUND;

    return {
        isLoading: false,
        errorInfo: null,
        data: searchResult,
    };
};
