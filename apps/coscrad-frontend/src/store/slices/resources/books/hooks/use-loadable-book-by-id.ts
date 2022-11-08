import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableBooks } from './use-loadable-books';

export const useLoadableBookById = () => useMaybeLoadableFromRouteParamsId(useLoadableBooks);
