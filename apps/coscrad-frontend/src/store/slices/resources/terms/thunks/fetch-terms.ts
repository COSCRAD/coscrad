import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';
import { TermIndexState } from '../types/term-index-state';

const buildTermsEndpoint = () => `${getApiResourcesBaseRoute()}/terms`;

export const fetchTerms = createFetchThunk<TermIndexState>(
    buildResourceFetchActionPrefix(TERMS),
    buildTermsEndpoint()
);
