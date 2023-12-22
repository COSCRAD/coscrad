import { RootState } from '../../..';
import { BIBLIOGRAPHIC_CITATIONS } from './constants';

export const selectLoadableBibliographicCitations = (state: RootState) =>
    state[BIBLIOGRAPHIC_CITATIONS];
