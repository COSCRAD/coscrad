import { IIndexQueryResult } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { MEDIA_ITEMS } from './constants';
import { fetchMediaItems } from './thunks';

const initialState = buildInitialLoadableState<IIndexQueryResult>();

const mediaItemSlice = createSlice({
    name: MEDIA_ITEMS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchMediaItems);
    },
});

export const mediaItemReducer = mediaItemSlice.reducer;
