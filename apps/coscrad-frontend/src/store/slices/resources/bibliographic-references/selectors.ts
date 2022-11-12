import { RootState } from '../../..';
import { BIBLIOGRAPHIC_REFERENCES } from './constants';

export const selectLoadableBibliographicReferences = (state: RootState) =>
    state[BIBLIOGRAPHIC_REFERENCES];
