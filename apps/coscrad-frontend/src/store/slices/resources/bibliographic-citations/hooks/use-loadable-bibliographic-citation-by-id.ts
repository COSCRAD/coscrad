import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableBibliographicCitations } from './use-loadable-bibliographic-citations';

export const useLoadableBibliographicCitationById = (id: string) =>
    useLoadableSearchResult(useLoadableBibliographicCitations, id);
