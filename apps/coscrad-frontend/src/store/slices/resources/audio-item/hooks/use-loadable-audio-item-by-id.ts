import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableAudioItems } from './use-loadable-audio-items';

export const useLoadableAudioItemById = (id: string) =>
    useLoadableSearchResult(useLoadableAudioItems, id);
