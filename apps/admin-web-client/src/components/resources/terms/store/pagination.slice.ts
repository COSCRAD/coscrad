import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';
import { IUserQueryOptions } from './terms.api';

const initialState: IUserQueryOptions = {
    pagination: {
        page: 1,
        size: DEFAULT_PAGE_SIZE,
    },
};

export const paginationSlice = createSlice({
    name: 'paginationOptions',
    initialState,
    reducers: {
        setPaginationOptions: (state, action: PayloadAction<IUserQueryOptions>) => {
            state = action.payload;
        },
        setPageSize: (state, action: PayloadAction<number>) => {
            state.pagination.size = action.payload;

            if (action.payload > state.pagination.size) {
                state.pagination.page = 1;
            }
        },
        setPage: (state, action: PayloadAction<number>) => {
            state.pagination.page = action.payload;
        },
    },
});

export const { setPage, setPageSize } = paginationSlice.actions;

export default paginationSlice.reducer;
