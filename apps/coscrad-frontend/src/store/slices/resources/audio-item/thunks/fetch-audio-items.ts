import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { AUDIO_ITEMS } from '../constants';
import { AudioItemIndexState } from '../types';

export const fetchAudioItems = createFetchThunk<AudioItemIndexState>(
    buildResourceFetchActionPrefix(AUDIO_ITEMS),
    `${getApiResourcesBaseRoute()}/audioItems`
);
