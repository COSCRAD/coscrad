import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableMediaItems } from './use-loadable-media-items';

export const useLoadableMediaItemById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableMediaItems);
