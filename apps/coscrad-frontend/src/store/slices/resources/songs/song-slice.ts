import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { SONG } from './constants';
import { fetchSongs } from './thunks';
import { SongIndexState, SongSliceState } from './types';

export const initialState: SongSliceState = buildInitialLoadableState<SongIndexState>();

export const songSlice = createSlice({
    name: SONG,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchSongs);
    },
});

export const songReducer = songSlice.reducer;
