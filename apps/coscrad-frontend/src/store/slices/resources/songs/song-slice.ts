import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { SONGS } from './constants';
import { fetchSongs } from './thunks';
import { SongIndexState, SongSliceState } from './types';

export const initialState: SongSliceState = buildInitialLoadableState<SongIndexState>();

export const songSlice = createSlice({
    name: SONGS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchSongs);
    },
});

export const songReducer = songSlice.reducer;
