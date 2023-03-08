import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { PLAYLISTS } from '../constants';
import { PlaylistIndexState } from '../types';

export const fecthPlaylists = createFetchThunk<PlaylistIndexState>(
    buildResourceFetchActionPrefix(PLAYLISTS),
    `${getApiResourcesBaseRoute()}/Playlists`
);
