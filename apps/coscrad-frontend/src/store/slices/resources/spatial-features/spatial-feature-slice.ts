import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../../utils';
import { buildReducersForThunk } from '../../utils/buildReducersForThunk';
import { SPATIAL_FEATURE } from './constants';
import { fetchSpatialFeatures } from './thunks';
import { SpatialFeatureIndexState, SpatialFeatureSliceState } from './types';

const initialState: SpatialFeatureSliceState =
    buildInitialLoadableState<SpatialFeatureIndexState>();

export const spatialFeatureSlice = createSlice({
    name: SPATIAL_FEATURE,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchSpatialFeatures);
    },
});

export const spatialFeatureReducer = spatialFeatureSlice.reducer;
