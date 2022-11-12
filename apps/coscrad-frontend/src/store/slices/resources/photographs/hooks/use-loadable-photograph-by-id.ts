import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadablePhotographs } from './use-loadable-photographs';

export const useLoadablePhotographById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadablePhotographs);
