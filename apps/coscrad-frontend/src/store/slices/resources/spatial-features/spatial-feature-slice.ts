import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/build-reducers-for-thunk';
import { SPATIAL_FEATURES } from './constants';
import { fetchSpatialFeatures } from './thunks';
import { SpatialFeatureIndexState } from './types';

const initialState = buildInitialLoadableState<SpatialFeatureIndexState>();

export const spatialFeatureSlice = createSlice({
    name: SPATIAL_FEATURES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchSpatialFeatures);
    },
});

export const spatialFeatureReducer = spatialFeatureSlice.reducer;
