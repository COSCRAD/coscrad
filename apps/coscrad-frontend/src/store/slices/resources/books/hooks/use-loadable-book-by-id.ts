import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableBooks } from './use-loadable-books';

export const useLoadableBookById = (id: string) => useLoadableSearchResult(useLoadableBooks, id);
