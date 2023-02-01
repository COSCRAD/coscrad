import { RootState } from '../../../..';
import { AUDIO_ITEMS } from '../constants';

export const selectLoadableAudioItems = (state: RootState) => state[AUDIO_ITEMS];
