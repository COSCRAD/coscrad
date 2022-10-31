import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

const buildTermsEndpoint = () => `${getApiResourcesBaseRoute()}/terms`;

export const fetchTerms = createFetchThunk<IIndexQueryResult<IBaseViewModel>>(
    `${RESOURCES}/${TERMS}/fetch`,
    buildTermsEndpoint()
);
