import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableBibliographicReferences } from './use-loadable-bibliographic-references';

export const useLoadableBibliographicReferenceById = (id: string) =>
    useLoadableSearchResult(useLoadableBibliographicReferences, id);
