import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BIBLIOGRAPHIC_REFERENCES } from '../constants';
import { BibliographicReferenceIndexState } from '../types';

export const fetchBibliographicReferences = createFetchThunk<BibliographicReferenceIndexState>(
    buildResourceFetchActionPrefix(BIBLIOGRAPHIC_REFERENCES),
    `${getApiResourcesBaseRoute()}/bibliographicReferences`
);
