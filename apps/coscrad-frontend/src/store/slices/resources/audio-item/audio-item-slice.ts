import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { AUDIO_ITEMS } from './constants';
import { fetchAudioItems } from './thunks/fetch-audio-items';
import { AudioItemIndexState, AudioItemSliceState } from './types';

const initialState: AudioItemSliceState = buildInitialLoadableState<AudioItemIndexState>();

export const audioItemSlice = createSlice({
    name: AUDIO_ITEMS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchAudioItems);
    },
});

export const audioItemReducer = audioItemSlice.reducer;
