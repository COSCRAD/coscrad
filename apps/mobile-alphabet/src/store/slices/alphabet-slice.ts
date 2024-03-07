import { PayloadAction, createSlice } from '@reduxjs/toolkit';

type AlphabetApiDataPayload = {
    endpoint: string;
    data: JSON;
};

const alphabetApiSlice = createSlice({
    name: 'alphabetApi',
    initialState: {},
    reducers: {
        setApiData: (state, action: PayloadAction<AlphabetApiDataPayload>) => {
            const data = action.payload;
            state = data;
        },
    },
});

export const { setApiData } = alphabetApiSlice.actions;

export default alphabetApiSlice.reducer;
