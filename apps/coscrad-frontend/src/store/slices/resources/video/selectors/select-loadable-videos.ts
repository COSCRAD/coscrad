import { RootState } from '../../../..';
import { VIDEOS } from '../constants';

export const selectLoadableVideos = (state: RootState) => state[VIDEOS];
