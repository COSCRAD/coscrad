import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { SONG } from '../constants';
import { SongIndexState } from '../types';

export const fetchSongs = createFetchThunk<SongIndexState>(
    `${RESOURCES}/${SONG}/fetch`,
    `${getApiResourcesBaseRoute()}/songs`
);
