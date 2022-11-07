import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableBibliographicReferences } from './useLoadableBibliographicReference';

export const useLoadableBibliographicReferenceById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableBibliographicReferences);
