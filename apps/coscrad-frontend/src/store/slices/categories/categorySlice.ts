import { ICategoryTreeViewModel } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/buildReducersForThunk';
import { CATEGORY_TREE } from './constants';
import { fetchCategoryTree } from './thunks';
import { CategorySliceState } from './types';

const initialState: CategorySliceState = buildInitialLoadableState<ICategoryTreeViewModel>();

export const categorySlice = createSlice({
    name: CATEGORY_TREE,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchCategoryTree);
    },
});

export const categoryTreeReducer = categorySlice.reducer;
