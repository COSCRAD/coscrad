import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TRANSCRIBED_AUDIO_ITEMS } from '../constants';
import { TranscribedAudioIndexState } from '../types';

export const fetchTranscribedAudioItems = createFetchThunk<TranscribedAudioIndexState>(
    buildResourceFetchActionPrefix(TRANSCRIBED_AUDIO_ITEMS),
    `${getApiResourcesBaseRoute()}/transcribedAudioItems`
);
