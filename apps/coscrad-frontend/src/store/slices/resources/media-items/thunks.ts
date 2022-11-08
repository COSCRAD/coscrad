import { createFetchThunk } from '../../utils/createFetchThunk';
import { RESOURCES } from '../constants';
import { getApiResourcesBaseRoute } from '../shared';
import { MEDIA_ITEMS } from './constants';
import { MediaItemIndexState } from './types';

export const fetchMediaItems = createFetchThunk<MediaItemIndexState>(
    `${RESOURCES}/${MEDIA_ITEMS}/fetch`,
    `${getApiResourcesBaseRoute()}/mediaItems`
);
