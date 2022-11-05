import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks/use-maybe-loadable-from-route-params-id';
import { useLoadableVocabularyLists } from './useLoadableVocabularyLists';

export const useLoadableVocabularyListById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableVocabularyLists);
