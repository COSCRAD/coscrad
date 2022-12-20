import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { TERMS } from './constants';
import { fetchTerms } from './thunks';
import { TermSliceState } from './types';
import { TermIndexState } from './types/term-index-state';

const initialState: TermSliceState = buildInitialLoadableState<TermIndexState>();

export const termSlice = createSlice({
    name: TERMS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchTerms);
    },
});

export const termReducer = termSlice.reducer;
