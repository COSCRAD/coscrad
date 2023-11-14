import { RootState } from '../../..';
import { DIGITAL_TEXTS } from './constants';

export const selectLoadableDigitalTexts = (state: RootState) => state[DIGITAL_TEXTS];
