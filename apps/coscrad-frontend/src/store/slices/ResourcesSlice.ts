import { IAggregateInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getConfig } from '../../config';

const RESOURCES = 'resources';

export type ResourcesState = {
    infos: IAggregateInfo[];
    resources: unknown[];
    isLoading: boolean;
};

const initialState: ResourcesState = {
    // We may want a separate resourceInfoSlice
    infos: [],
    resources: [],
    isLoading: false,
};

// TODO move to api-interfaces
type FSA<TPayload = unknown> = {
    type: string;
    payload: TPayload;
};

// we might want to type this and keep it as a helper for testing \ sandboxing
const delay = async (t, v) => new Promise((resolve) => setTimeout(resolve.bind(null, v), t));

export const fetchResourceInfos = createAsyncThunk(`${RESOURCES}/fetchInfos`, async () => {
    console.log('initialting requestt!');
    const baseUrl = getConfig().apiUrl;

    // Should we include "api" here?
    const endpoint = `${baseUrl}/api/resources`;

    // todo remove this later. it's just for testing purposes
    // @ts-expect-error will remove
    const response = await delay(4000)
        .then(() => fetch(endpoint))

        .then(
            // trust the backend. cypress can give us more confidence.
            (response) => {
                return response.json() as Promise<IAggregateInfo[]>;
            }
        );

    return response;
});

export const resourcesSlice = createSlice({
    name: RESOURCES,
    initialState,
    reducers: {
        setInfo: (state, action: FSA<IAggregateInfo[]>) => {
            state.infos = action.payload;
        },
    },
    extraReducers: {
        [fetchResourceInfos.pending as unknown as string]: (state: ResourcesState, action) => {
            state.isLoading = true;
        },
        [fetchResourceInfos.fulfilled as unknown as string]: (state: ResourcesState, action) => {
            state.infos = action.payload;
            state.isLoading = false;
        },
        // handle rejection
    },
});
