import { RootState } from '../..';
import { NOTES } from './constants';

export const selectLoadableNotes = (state: RootState) => state[NOTES];
