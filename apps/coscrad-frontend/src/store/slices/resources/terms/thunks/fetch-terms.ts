import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

const buildTermsEndpoint = () => `${getApiResourcesBaseRoute()}/terms`;

export const fetchTerms = createFetchThunk<IIndexQueryResult<ITermViewModel>>(
    buildResourceFetchActionPrefix(TERMS),
    buildTermsEndpoint()
);
