import { useLoadable } from '../../../../../utils/custom-hooks/useLoadable';
import { selectLoadableTranscribedAudioItems } from '../selectors';
import { fetchTranscribedAudioItems } from '../thunks/fetch-transcribed-audio-items';

export const useLoadableTranscribedAudioItems = () =>
    useLoadable({
        selector: selectLoadableTranscribedAudioItems,
        fetchThunk: fetchTranscribedAudioItems,
    });
