import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { PHOTOGRAPHS } from './constants';
import { fetchPhotographs } from './thunks';
import { PhotographSliceState } from './types';

const initialState: PhotographSliceState =
    buildInitialLoadableState<IIndexQueryResult<IPhotographViewModel>>();

export const photographSlice = createSlice({
    name: PHOTOGRAPHS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchPhotographs);
    },
});

export const photographReducer = photographSlice.reducer;
