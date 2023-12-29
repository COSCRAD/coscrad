import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { BIBLIOGRAPHIC_CITATIONS } from './constants';
import { fetchBibliographicCitations } from './thunks';
import { BibliographicCitationIndexState, BibliographicCitationSliceState } from './types';

const initialState: BibliographicCitationSliceState =
    buildInitialLoadableState<BibliographicCitationIndexState>();

export const bibliographicCitationSlice = createSlice({
    name: BIBLIOGRAPHIC_CITATIONS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchBibliographicCitations);
    },
});

export const bibliographicCitationReducer = bibliographicCitationSlice.reducer;
