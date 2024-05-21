import { RootState } from '..';
import { ALPHABET } from './alphabet-slice';

export const selectAlphabet = (state: RootState) => state[ALPHABET];
