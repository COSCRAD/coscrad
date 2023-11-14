import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { DIGITAL_TEXTS } from './constants';
import { fetchDigitalTexts } from './thunks';
import { DigitalTextIndexState } from './types';

const initialState = buildInitialLoadableState<DigitalTextIndexState>();

const DigitalTextSlice = createSlice({
    name: DIGITAL_TEXTS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchDigitalTexts);
    },
});

export const DigitalTextReducer = DigitalTextSlice.reducer;
