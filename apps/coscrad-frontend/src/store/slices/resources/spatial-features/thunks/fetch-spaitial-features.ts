import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { SPATIAL_FEATURE } from '../constants';

export const fetchSpatialFeatures = createFetchThunk(
    `${RESOURCES}/${SPATIAL_FEATURE}/fetch`,
    `${getApiResourcesBaseRoute()}/spatialFeatures`
);
