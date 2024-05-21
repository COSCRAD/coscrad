import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import config from './../../app/Components/config.json';
import { AlphabetData } from './types';

export const ALPHABET = 'alphabet';

export const fetchAlphabets = createAsyncThunk(`${ALPHABET}/fetch`, async () => {
    const response = await fetch(config.apiUrl);
    return response.json();
});

enum HttpStatusCode {
    ok = 200,
    badRequest = 400,
    unauthorized = 401,
    forbidden = 403,
    notFound = 404,
    internalError = 500,
}

interface IHttpErrorInfo {
    code: HttpStatusCode;
    message: string;
}

interface ILoadable<T> {
    data: null | T;
    isLoading: boolean;
    errorInfo: null | IHttpErrorInfo;
}

export type AlphabetSliceState = ILoadable<AlphabetData>;

const initialState: AlphabetSliceState = {
    data: null,
    isLoading: false,
    errorInfo: null,
};

const alphabetSlice = createSlice({
    name: 'alphabetApi',
    initialState,
    extraReducers: (builder) => {
        builder.addCase(fetchAlphabets.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchAlphabets.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        });
        builder.addCase(fetchAlphabets.rejected, (state, action) => {
            state.isLoading = false;
            if (action.payload) {
                state.errorInfo = action.payload as IHttpErrorInfo;
            }

            state.errorInfo = {
                code: HttpStatusCode.internalError,
                message: action.error.message || 'Unknown error occurred',
            };
        });
    },
    reducers: {},
});

export const alphabetReducer = alphabetSlice.reducer;
