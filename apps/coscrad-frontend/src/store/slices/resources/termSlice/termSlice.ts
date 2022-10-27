import { IBaseViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { TERMS } from './constants';
import { fetchTerms } from './thunks';
import { TermSliceState } from './types';

const initialState: TermSliceState = buildInitialLoadableState<IIndexQueryResult<IBaseViewModel>>();

export const termSlice = createSlice({
    name: TERMS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchTerms);
    },
});

export const termReducer = termSlice.reducer;
