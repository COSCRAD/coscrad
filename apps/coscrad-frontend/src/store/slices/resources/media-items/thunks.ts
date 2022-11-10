import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { SPATIAL_FEATURES } from '../spatial-features';
import { MediaItemIndexState } from './types';

export const fetchMediaItems = createFetchThunk<MediaItemIndexState>(
    buildResourceFetchActionPrefix(SPATIAL_FEATURES),
    `${getApiResourcesBaseRoute()}/mediaItems`
);
