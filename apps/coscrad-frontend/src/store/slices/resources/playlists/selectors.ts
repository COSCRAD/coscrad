import { RootState } from '../../..';
import { PLAYLISTS } from './constants';

export const selectLoadablePlaylists = (state: RootState) => state[PLAYLISTS];
