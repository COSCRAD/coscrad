import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { BIBLIOGRAPHIC_REFERENCE } from '../constants';
import { BibliographicReferenceIndexState } from '../types';

export const fetchBibliographicReferences = createFetchThunk<BibliographicReferenceIndexState>(
    `${RESOURCES}/${BIBLIOGRAPHIC_REFERENCE}/fetch`,
    `${getApiResourcesBaseRoute()}/bibliographicReferences`
);
