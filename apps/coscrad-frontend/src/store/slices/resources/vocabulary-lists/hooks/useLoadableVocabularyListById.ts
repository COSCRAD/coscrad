import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableVocabularyLists } from './useLoadableVocabularyLists';

export const useLoadableVocabularyListById = (id: string) =>
    useLoadableSearchResult(useLoadableVocabularyLists, id);
