import { useLoadableSearchResult } from '../../resources/shared/hooks';
import { useLoadableTags } from './use-loadable-tags';

export const useLoadableTagById = (id: string) => useLoadableSearchResult(useLoadableTags, id);
