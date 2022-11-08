import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { BOOK } from './constants';
import { fetchBooks } from './thunks';
import { BookIndexState, BookSliceState } from './types';

const initialState: BookSliceState = buildInitialLoadableState<BookIndexState>();

const bookSlice = createSlice({
    name: BOOK,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchBooks);
    },
});

export const bookReducer = bookSlice.reducer;
