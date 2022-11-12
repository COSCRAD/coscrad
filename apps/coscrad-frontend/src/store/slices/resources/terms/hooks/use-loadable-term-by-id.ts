import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableTerms } from './use-loadable-terms';

export const useLoadableTermById = () => useMaybeLoadableFromRouteParamsId(useLoadableTerms);
