import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableVideos } from './use-loadable-videos';

export const useLoadableVideoById = (id: string) => useLoadableSearchResult(useLoadableVideos, id);
