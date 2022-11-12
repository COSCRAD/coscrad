import { RootState } from '../../../..';
import { TRANSCRIBED_AUDIO_ITEMS } from '../constants';

export const selectLoadableTranscribedAudioItems = (state: RootState) =>
    state[TRANSCRIBED_AUDIO_ITEMS];
