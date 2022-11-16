import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableMediaItems } from './use-loadable-media-items';

export const useLoadableMediaItemById = (id: string) =>
    useLoadableSearchResult(useLoadableMediaItems, id);
