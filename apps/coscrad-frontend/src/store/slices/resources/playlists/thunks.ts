import { buildResourceFetchActionPrefix } from '../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../shared';
import { PLAYLISTS } from './constants';
import { PlaylistIndexState } from './types';

export const fetchPlaylists = createFetchThunk<PlaylistIndexState>(
    buildResourceFetchActionPrefix(PLAYLISTS),
    `${getApiResourcesBaseRoute()}/playlists`
);
