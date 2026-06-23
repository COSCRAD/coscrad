import { RootState } from '../../..';
import { ID_GENERATION } from '../constants';

export const selectLoadableGeneratedId = (state: RootState) => state[ID_GENERATION];
