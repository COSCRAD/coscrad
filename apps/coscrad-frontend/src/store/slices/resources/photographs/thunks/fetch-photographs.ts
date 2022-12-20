import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { PHOTOGRAPHS } from '../constants';
import { PhotographIndexState } from '../types';

export const fetchPhotographs = createFetchThunk<PhotographIndexState>(
    buildResourceFetchActionPrefix(PHOTOGRAPHS),
    `${getApiResourcesBaseRoute()}/photographs`
);
