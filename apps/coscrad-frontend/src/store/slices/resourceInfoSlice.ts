import { HttpStatusCode, IAggregateInfo, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getConfig } from '../../config';

const RESOURCES = 'resources';

export type ResourceInfosState = {
    infos: IAggregateInfo[];
    isLoading: boolean;
    errorInfo: null | IHttpErrorInfo;
};

const initialState: ResourceInfosState = {
    // We may want a separate resourceInfoSlice
    infos: [],
    isLoading: false,
    errorInfo: null,
};

export const fetchResourceInfos = createAsyncThunk(
    `${RESOURCES}/fetchInfos`,
    async (_, thunkApi) => {
        const baseUrl = getConfig().apiUrl;

        // Should we include "api" here?
        const endpoint = `${baseUrl}/resources`;

        const response = await fetch(endpoint);

        const responseJson = await response.json();

        if (response.status !== HttpStatusCode.ok)
            /**
             * TODO We need more specific error handling that considers the format of
             * and difference between a returned error, a system error (backend runtime exception),
             * and other errors (e.g. not found, not authroized).
             *
             * Further, we need to break this logic out into a utility so we
             * can reuse it across all API requests.
             */
            return thunkApi.rejectWithValue({
                code: responseJson.statusCode,
                message: responseJson.error,
            } as IHttpErrorInfo);

        // Trust the backend. Cypress can give us more confidence.
        return responseJson as Promise<IAggregateInfo[]>;
    }
);

/**
 * Note that this slice is only for `Resource Info`, which includes descriptions,
 * links, and schemas for resources, but not the data itself. There is a separate
 * slice for the actual `Resources` with all the resource view models and their
 * available actions.
 */
export const resourceInfoSlice = createSlice({
    name: RESOURCES,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(fetchResourceInfos.pending, (state: ResourceInfosState, _) => {
            state.isLoading = true;
        });

        builder.addCase(fetchResourceInfos.fulfilled, (state: ResourceInfosState, action) => {
            // call set infos action
            state.infos = action.payload;
            state.isLoading = false;
        });

        builder.addCase(fetchResourceInfos.rejected, (state: ResourceInfosState, action) => {
            if (action.payload) {
                state.errorInfo = action.payload as IHttpErrorInfo;
            } else {
                state.errorInfo = {
                    code: HttpStatusCode.internalError,
                    message: action.error.message,
                };
            }
        });
    },
});
