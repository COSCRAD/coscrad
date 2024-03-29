import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { VOCABULARY_LISTS } from './constants';
import { fetchVocabularyLists } from './thunks';
import { VocabularyListIndexState } from './types/vocabulary-list-index-state';
import { VocabularyListSliceState } from './types/vocabulary-list-slice-state';

const initialState: VocabularyListSliceState =
    buildInitialLoadableState<VocabularyListIndexState>();

export const vocabularyListSlice = createSlice({
    name: VOCABULARY_LISTS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchVocabularyLists);
    },
});

export const vocabularyListReducer = vocabularyListSlice.reducer;
