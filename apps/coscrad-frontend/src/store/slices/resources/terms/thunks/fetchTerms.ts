import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

const buildTermsEndpoint = () => `${getApiResourcesBaseRoute()}/terms`;

export const fetchTerms = createFetchThunk<IIndexQueryResult<ITermViewModel>>(
    buildResourceFetchActionPrefix(TERMS),
    buildTermsEndpoint()
);
