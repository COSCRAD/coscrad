import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableDigitalTextPages } from './use-Loadable-DigitalTextPages';

export const useLoadableDigitalTextPagesByDigitalTextId = (id: string) =>
    useLoadableSearchResult(useLoadableDigitalTextPages, id);
