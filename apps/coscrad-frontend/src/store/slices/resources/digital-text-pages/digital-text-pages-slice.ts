import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { DIGITAL_TEXT_PAGES } from './constants';
import { fetchDigitalTextPages } from './thunks';
import { DigitalTextPagesIndexState } from './types';

const initialState = buildInitialLoadableState<DigitalTextPagesIndexState>();

const DigitalTextPagesSlice = createSlice({
    name: DIGITAL_TEXT_PAGES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchDigitalTextPages);
    },
});

export const DigitalTextPageReducer = DigitalTextPagesSlice.reducer;
