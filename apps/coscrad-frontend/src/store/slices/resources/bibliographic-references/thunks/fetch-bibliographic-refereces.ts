import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BIBLIOGRAPHIC_REFERENCES } from '../constants';
import { BibliographicReferenceIndexState } from '../types';

export const fetchBibliographicReferences = createFetchThunk<BibliographicReferenceIndexState>(
    buildResourceFetchActionPrefix(BIBLIOGRAPHIC_REFERENCES),
    `${getApiResourcesBaseRoute()}/bibliographicReferences`
);
