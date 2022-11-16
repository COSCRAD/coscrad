import { useLoadableSearchResult } from '../../shared/hooks';
import { useLoadableSpatialFeatures } from './use-loadable-spatial-features';

export const useLoadableSpatialFeatureById = (id: string) =>
    useLoadableSearchResult(useLoadableSpatialFeatures, id);
