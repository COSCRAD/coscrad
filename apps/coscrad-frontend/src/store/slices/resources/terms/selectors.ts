import { RootState } from '../../..';
import { TERMS } from './constants';

export const selectLoadableTerms = (state: RootState) => state[TERMS];
