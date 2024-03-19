import { PayloadAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { AlphabetData } from 'app/Components/Menu';
import config from './../../app/Components/Config.json';

type AlphabetApiDataPayload = {
    endpoint: string;
    data: AlphabetData;
    isLoading: boolean;
    isError: boolean;
};

export const fetchAlphabetApiData = createAsyncThunk('fetchAlphabetApiData', async () => {
    const response = await fetch(config.apiUrl);
    return response.json();
});

const alphabetApiSlice = createSlice({
    name: 'alphabetApi',
    initialState: {
        isLoading: false,
        data: null,
        isError: false,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchAlphabetApiData.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(fetchAlphabetApiData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        });
        builder.addCase(fetchAlphabetApiData.rejected, (state, action) => {
            console.log('Error fetching Alphabet data', action.payload);
            state.isError = true;
        });
    },
    reducers: {
        setApiData: (state, action: PayloadAction<AlphabetApiDataPayload>) => {
            const data = action.payload;
            return data;
        },
    },
});

export const { setApiData } = alphabetApiSlice.actions;

export default alphabetApiSlice.reducer;
