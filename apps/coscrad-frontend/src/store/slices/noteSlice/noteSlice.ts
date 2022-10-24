import { INoteViewModel } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/buildReducersForThunk';
import { NOTES } from './constants';
import { fetchNotes } from './thunks/';
import { NoteSliceState } from './types';

const initialState: NoteSliceState = buildInitialLoadableState<INoteViewModel[]>();

export const noteSlice = createSlice({
    name: NOTES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchNotes);
    },
});

export const noteReducer = noteSlice.reducer;
