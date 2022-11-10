import { buildResourceFetchActionPrefix } from '../../../utils/buildResourceFetchActionPrefix';
import { createFetchThunk } from '../../../utils/createFetchThunk';
import { getApiResourcesBaseRoute } from '../../shared';
import { TRANSCRIBED_AUDIO } from '../constants';

export const fetchTranscribedAudioItems = createFetchThunk(
    buildResourceFetchActionPrefix(TRANSCRIBED_AUDIO),
    `${getApiResourcesBaseRoute()}/transcribedAudioItems`
);
