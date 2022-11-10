import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { SONG } from '../constants';
import { SongIndexState } from '../types';

export const fetchSongs = createFetchThunk<SongIndexState>(
    buildResourceFetchActionPrefix(SONG),
    `${getApiResourcesBaseRoute()}/songs`
);
