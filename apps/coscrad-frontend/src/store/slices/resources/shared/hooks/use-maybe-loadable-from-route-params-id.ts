import { IBaseViewModel, IDetailQueryResult, IIndexQueryResult } from '@coscrad/api-interfaces';
import { useIdFromLocation } from '../../../../../utils/custom-hooks/use-id-from-location';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { IMaybeLoadable, NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';

export const useMaybeLoadableFromRouteParamsId = <T extends IBaseViewModel>(
    useLoadableItems: () => [ILoadable<IIndexQueryResult<T>>]
): IMaybeLoadable<IDetailQueryResult<T>> => {
    const [idFromLocation] = useIdFromLocation();

    const [loadableTranscribedAudioItems] = useLoadableItems();

    const { data: allItems, isLoading, errorInfo } = loadableTranscribedAudioItems;

    if (isLoading || errorInfo !== null || allItems === null)
        return {
            isLoading,
            errorInfo,
            data: null,
        };

    const searchResult =
        allItems.data.find(({ data: { id } }) => id === idFromLocation) || NOT_FOUND;

    return {
        isLoading: false,
        errorInfo: null,
        data: searchResult,
    };
};
