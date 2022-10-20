import { ITag } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/buildReducersForThunk';
import { TAGS } from './constants';
import { fetchTags } from './thunks';
import { TagSliceState } from './types/TagSliceState';

const initialState: TagSliceState = buildInitialLoadableState<ITag[]>();

export const tagSlice = createSlice({
    name: TAGS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchTags);
    },
});

export const tagReducer = tagSlice.reducer;
