import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableTerms } from './use-loadable-terms';

export const useLoadableTermById = (id: string) => useLoadableSearchResult(useLoadableTerms, id);
