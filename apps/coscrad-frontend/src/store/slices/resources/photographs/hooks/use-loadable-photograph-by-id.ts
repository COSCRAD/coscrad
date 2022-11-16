import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadablePhotographs } from './use-loadable-photographs';

export const useLoadablePhotographById = (id: string) =>
    useLoadableSearchResult(useLoadablePhotographs, id);
