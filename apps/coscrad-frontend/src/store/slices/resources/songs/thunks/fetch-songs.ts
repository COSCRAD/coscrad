import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SONGS } from '../constants';
import { SongIndexState } from '../types';

export const fetchSongs = createFetchThunk<SongIndexState>(
    buildResourceFetchActionPrefix(SONGS),
    `${getApiResourcesBaseRoute()}/songs`
);
