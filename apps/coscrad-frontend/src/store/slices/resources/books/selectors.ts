import { RootState } from '../../..';
import { BOOKS } from './constants';

export const selectLoadableBooks = (state: RootState) => state[BOOKS];
