import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SPATIAL_FEATURES } from '../constants';

export const fetchSpatialFeatures = createFetchThunk(
    buildResourceFetchActionPrefix(SPATIAL_FEATURES),
    `${getApiResourcesBaseRoute()}/spatialFeatures`
);
