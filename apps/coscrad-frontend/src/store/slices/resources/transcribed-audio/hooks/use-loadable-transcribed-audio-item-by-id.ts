import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableTranscribedAudioItems } from './use-loadable-transcribed-audio-items';

export const useLoadableTranscribedAudioItemByIdFromLocation = (id: string) =>
    useLoadableSearchResult(useLoadableTranscribedAudioItems, id);
