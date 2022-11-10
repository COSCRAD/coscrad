import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TRANSCRIBED_AUDIO_ITEMS } from '../constants';

export const fetchTranscribedAudioItems = createFetchThunk(
    buildResourceFetchActionPrefix(TRANSCRIBED_AUDIO_ITEMS),
    `${getApiResourcesBaseRoute()}/transcribedAudioItems`
);
