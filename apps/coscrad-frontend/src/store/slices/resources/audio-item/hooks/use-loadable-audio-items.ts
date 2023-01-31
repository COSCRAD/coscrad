import { useLoadable } from '../../shared/hooks';
import { selectLoadableAudioItems } from '../selectors';
import { fetchAudioItems } from '../thunks/fetch-audio-items';

export const useLoadableAudioItems = () =>
    useLoadable({
        selector: selectLoadableAudioItems,
        fetchThunk: fetchAudioItems,
    });
