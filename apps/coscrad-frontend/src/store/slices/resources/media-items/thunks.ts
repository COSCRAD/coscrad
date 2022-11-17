import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { MEDIA_ITEMS } from './constants';
import { MediaItemIndexState } from './types';

export const fetchMediaItems = createFetchThunk<MediaItemIndexState>(
    buildResourceFetchActionPrefix(MEDIA_ITEMS),
    `${getApiResourcesBaseRoute()}/mediaItems`
);
