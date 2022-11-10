import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SPATIAL_FEATURES } from '../constants';

export const fetchSpatialFeatures = createFetchThunk(
    buildResourceFetchActionPrefix(SPATIAL_FEATURES),
    `${getApiResourcesBaseRoute()}/spatialFeatures`
);
