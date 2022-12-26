import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/build-reducers-for-thunk';
import { ID_GENERATION } from './constants';
import { acquireId } from './thunks';
import { IdGenerationSliceState } from './types';

const initialState: IdGenerationSliceState = buildInitialLoadableState<string>();

export const idGenerationSlice = createSlice({
    name: ID_GENERATION,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, acquireId);
    },
});

export const idGenerationReducer = idGenerationSlice.reducer;
