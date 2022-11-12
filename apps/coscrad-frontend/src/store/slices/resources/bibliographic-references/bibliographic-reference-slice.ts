import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { BIBLIOGRAPHIC_REFERENCES } from './constants';
import { fetchBibliographicReferences } from './thunks';
import { BibliographicReferenceIndexState, BibliographicReferenceSliceState } from './types';

const initialState: BibliographicReferenceSliceState =
    buildInitialLoadableState<BibliographicReferenceIndexState>();

export const bibliographicReferenceSlice = createSlice({
    name: BIBLIOGRAPHIC_REFERENCES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchBibliographicReferences);
    },
});

export const bibliographicReferenceReducer = bibliographicReferenceSlice.reducer;
