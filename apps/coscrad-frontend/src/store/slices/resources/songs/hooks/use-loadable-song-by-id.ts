import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableSongs } from './use-loadable-songs';

export const useLoadableSongById = (id: string) => useLoadableSearchResult(useLoadableSongs, id);
