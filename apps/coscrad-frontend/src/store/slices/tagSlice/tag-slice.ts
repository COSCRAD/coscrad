import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/build-reducers-for-thunk';
import { TAGS } from './constants';
import { fetchTags } from './thunks';
import { TagIndexState } from './types/tag-index-state';
import { TagSliceState } from './types/tag-slice-state';

const initialState: TagSliceState = buildInitialLoadableState<TagIndexState>();

export const tagSlice = createSlice({
    name: TAGS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchTags);
    },
});

export const tagReducer = tagSlice.reducer;
