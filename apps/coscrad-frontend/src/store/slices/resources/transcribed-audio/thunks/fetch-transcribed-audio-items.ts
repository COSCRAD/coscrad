import { createFetchThunk } from '../../../utils/createFetchThunk';
import { RESOURCES } from '../../constants';
import { getApiResourcesBaseRoute } from '../../shared';
import { TRANSCRIBED_AUDIO } from '../constants';

export const fetchTranscribedAudioItems = createFetchThunk(
    `${RESOURCES}/${TRANSCRIBED_AUDIO}/fetch`,
    `${getApiResourcesBaseRoute()}/transcribedAudioItems`
);
