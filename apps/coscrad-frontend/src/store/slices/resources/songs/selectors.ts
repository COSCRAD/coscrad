import { RootState } from '../../..';
import { SONGS } from './constants';

export const selectLoadableSongs = (state: RootState) => state[SONGS];
