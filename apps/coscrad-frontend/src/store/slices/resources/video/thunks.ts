import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { VIDEOS } from './constants';
import { VideoIndexState } from './types';

export const fetchVideos = createFetchThunk<VideoIndexState>(
    buildResourceFetchActionPrefix(VIDEOS),
    `${getApiResourcesBaseRoute()}/videos`
);
