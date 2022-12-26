import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/build-reducers-for-thunk';
import { NOTES } from './constants';
import { fetchNotes } from './thunks';
import { NoteSliceState } from './types';
import { NoteIndexState } from './types/note-index-state';

const initialState: NoteSliceState = buildInitialLoadableState<NoteIndexState>();

export const noteSlice = createSlice({
    name: NOTES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchNotes);
    },
});

export const noteReducer = noteSlice.reducer;
