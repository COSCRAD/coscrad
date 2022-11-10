import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { VOCABULARY_LISTS } from './constants';
import { fetchVocabularyLists } from './thunks';
import { VocabularyListSliceState } from './types/vocabulary-list-slice-state';

const initialState: VocabularyListSliceState =
    buildInitialLoadableState<IIndexQueryResult<IVocabularyListViewModel>>();

export const vocabularyListSlice = createSlice({
    name: VOCABULARY_LISTS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchVocabularyLists);
    },
});

export const vocabularyListReducer = vocabularyListSlice.reducer;
