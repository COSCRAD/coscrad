import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TRANSCRIBED_AUDIO_ITEMS } from '../constants';

export const fetchTranscribedAudioItems = createFetchThunk(
    buildResourceFetchActionPrefix(TRANSCRIBED_AUDIO_ITEMS),
    `${getApiResourcesBaseRoute()}/transcribedAudioItems`
);
