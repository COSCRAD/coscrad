import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableDigitalTexts } from './use-Loadable-DigitalTextPages';

export const useLoadableDigitalTextsById = (id: string) =>
    useLoadableSearchResult(useLoadableDigitalTexts, id);
