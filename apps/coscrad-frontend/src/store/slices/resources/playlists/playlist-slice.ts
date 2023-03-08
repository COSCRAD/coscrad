import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { PLAYLISTS } from './constants';
import { fetchPlaylists } from './thunks';
import { PlaylistIndexState } from './types';

const initialState = buildInitialLoadableState<PlaylistIndexState>();

const PlaylistSlice = createSlice({
    name: PLAYLISTS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchPlaylists);
    },
});

export const PlaylistReducer = PlaylistSlice.reducer;
