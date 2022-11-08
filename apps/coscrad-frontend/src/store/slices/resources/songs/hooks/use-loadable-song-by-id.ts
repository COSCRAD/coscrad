import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableSongs } from './use-loadable-songs';

export const useLoadableSongById = () => useMaybeLoadableFromRouteParamsId(useLoadableSongs);
