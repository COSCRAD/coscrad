import { RootState } from '../../../..';
import { VOCABULARY_LISTS } from '../constants';

export const selectLoadableVocabularyLists = (state: RootState) => state[VOCABULARY_LISTS];
