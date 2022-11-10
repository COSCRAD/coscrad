import { useMaybeLoadableFromRouteParamsId } from '../../shared/hooks';
import { useLoadableBibliographicReferences } from './use-loadable-bibliographic-references';

export const useLoadableBibliographicReferenceById = () =>
    useMaybeLoadableFromRouteParamsId(useLoadableBibliographicReferences);
