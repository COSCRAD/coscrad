import { useLoadable } from '../../shared/hooks';
import { selectLoadableTranscribedAudioItems } from '../selectors';
import { fetchTranscribedAudioItems } from '../thunks/fetch-transcribed-audio-items';

export const useLoadableTranscribedAudioItems = () =>
    useLoadable({
        selector: selectLoadableTranscribedAudioItems,
        fetchThunk: fetchTranscribedAudioItems,
    });
