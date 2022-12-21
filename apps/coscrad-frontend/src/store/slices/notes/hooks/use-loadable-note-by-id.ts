import { useLoadableSearchResult } from '../../resources/shared/hooks';
import { useLoadableNotes } from './use-loadable-notes';

export const useLoadableNoteById = (id: string) => useLoadableSearchResult(useLoadableNotes, id);
