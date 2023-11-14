import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableDigitalTexts } from './use-Loadable-DigitalTexts';

export const useLoadableDigitalTextsById = (id: string) =>
    useLoadableSearchResult(useLoadableDigitalTexts, id);
