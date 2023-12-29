import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { BIBLIOGRAPHIC_CITATIONS } from '../constants';
import { BibliographicCitationIndexState } from '../types';

export const fetchBibliographicCitations = createFetchThunk<BibliographicCitationIndexState>(
    buildResourceFetchActionPrefix(BIBLIOGRAPHIC_CITATIONS),
    `${getApiResourcesBaseRoute()}/bibliographicCitations`
);
