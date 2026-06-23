import { RootState } from '../../..';
import { COMMAND_STATUS } from '../constants';

export const selectLoadableCommandStatus = (state: RootState) => state[COMMAND_STATUS];
