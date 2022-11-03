import { IDetailQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { useIdFromLocation } from '../../../../../utils/custom-hooks/use-id-from-location';
import { useLoadable } from '../../../../../utils/custom-hooks/useLoadable';
import { IMaybeLoadable, NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { selectLoadableTranscribedAudioItems } from '../selectors';
import { fetchTranscribedAudioItems } from '../thunks/fetch-transcribed-audio-items';

export const useLoadableTranscribedAudioItemByIdFromLocation = (): IMaybeLoadable<
    IDetailQueryResult<ITranscribedAudioViewModel>
> => {
    const [idFromLocation] = useIdFromLocation();

    const [loadableTranscribedAudioItems] = useLoadable({
        selector: selectLoadableTranscribedAudioItems,
        fetchThunk: fetchTranscribedAudioItems,
    });

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
