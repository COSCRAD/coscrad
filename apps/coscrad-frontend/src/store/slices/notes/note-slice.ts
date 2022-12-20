import { INoteViewModel, WithTags } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/build-reducers-for-thunk';
import { NOTES } from './constants';
import { fetchNotes } from './thunks';
import { NoteSliceState } from './types';

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * Remove `WithTags` in favor of `IIndexQueryResult`.
 */
const initialState: NoteSliceState = buildInitialLoadableState<WithTags<INoteViewModel>[]>();

export const noteSlice = createSlice({
    name: NOTES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchNotes);
    },
});

export const noteReducer = noteSlice.reducer;
