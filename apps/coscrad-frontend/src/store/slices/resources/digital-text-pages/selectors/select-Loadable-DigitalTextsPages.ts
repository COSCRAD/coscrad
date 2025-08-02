import { RootState } from '../../../..';
import { DIGITAL_TEXT_PAGES } from '../constants';

export const selectLoadableDigitalTextPages = (state: RootState) => state[DIGITAL_TEXT_PAGES];
