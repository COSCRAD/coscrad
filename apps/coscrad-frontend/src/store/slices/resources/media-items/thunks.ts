import { buildResourceFetchActionPrefix } from '../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../shared';
import { SPATIAL_FEATURES } from '../spatial-features';
import { MediaItemIndexState } from './types';

export const fetchMediaItems = createFetchThunk<MediaItemIndexState>(
    buildResourceFetchActionPrefix(SPATIAL_FEATURES),
    `${getApiResourcesBaseRoute()}/mediaItems`
);
