import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableSpatialFeatures } from './use-loadable-spatial-features';

export const useLoadableSpatialFeatureById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableSpatialFeatures);
