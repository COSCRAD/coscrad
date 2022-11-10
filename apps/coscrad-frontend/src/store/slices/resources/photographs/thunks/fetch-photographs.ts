import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { PHOTOGRAPHS } from '../constants';

export const fetchPhotographs = createFetchThunk<IIndexQueryResult<IPhotographViewModel>>(
    buildResourceFetchActionPrefix(PHOTOGRAPHS),
    `${getApiResourcesBaseRoute()}/photographs`
);
