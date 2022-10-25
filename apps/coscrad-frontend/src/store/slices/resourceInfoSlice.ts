import { IAggregateInfo } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { getConfig } from '../../config';
import { ILoadable } from './interfaces/loadable.interface';
import { buildReducersForThunk } from './utils/buildReducersForThunk';
import { createFetchThunk } from './utils/createFetchThunk';

export const RESOURCE_INFO = 'resourceInfo';

export type ResourceInfosState = ILoadable<IAggregateInfo[]>;

const initialState: ResourceInfosState = {
    data: [],
    isLoading: false,
    errorInfo: null,
};

export const fetchResourceInfos = createFetchThunk<IAggregateInfo[]>(
    `${RESOURCE_INFO}/fetchInfos`,
    `${getConfig().apiUrl}/resources`
);

/**
 * Note that this slice is only for `Resource Info`, which includes descriptions,
 * links, and schemas for resources, but not the data itself. There is a separate
 * slice for the actual `Resources` with all the resource view models and their
 * available actions.
 */
export const resourceInfoSlice = createSlice({
    name: RESOURCE_INFO,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForThunk(builder, fetchResourceInfos);
    },
});

export const resourceInfoReducer = resourceInfoSlice.reducer;