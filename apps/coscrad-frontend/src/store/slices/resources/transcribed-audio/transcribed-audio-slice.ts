import { IIndexQueryResult, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { TRANSCRIBED_AUDIO } from './constants';
import { fetchTranscribedAudioItems } from './thunks/fetch-transcribed-audio-items';
import { TranscribedAudioSliceState } from './types';

const initialState: TranscribedAudioSliceState =
    buildInitialLoadableState<IIndexQueryResult<ITranscribedAudioViewModel>>();

export const transcribedAudioSlice = createSlice({
    name: TRANSCRIBED_AUDIO,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchTranscribedAudioItems);
    },
});

export const transcribedAudioReducer = transcribedAudioSlice.reducer;
