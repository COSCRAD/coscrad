import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { VIDEOS } from './constants';
import { fetchVideos } from './thunks';
import { VideoIndexState, VideoSliceState } from './types';

const initialState: VideoSliceState = buildInitialLoadableState<VideoIndexState>();

export const videoSlice = createSlice({
    name: VIDEOS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchVideos);
    },
});

export const videoReducer = videoSlice.reducer;
