import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SPATIAL_FEATURE } from '../constants';

export const fetchSpatialFeatures = createFetchThunk(
    buildResourceFetchActionPrefix(SPATIAL_FEATURE),
    `${getApiResourcesBaseRoute()}/spatialFeatures`
);
