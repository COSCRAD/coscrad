import { ITermViewModel } from '@coscrad/api-interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';
import { IUserDefinedFilter, IUserQueryOptions } from './terms.api';

export type TermSliceState = {
    pagination: {
        page: number;
        size: number;
    };
    filter?: IUserDefinedFilter<ITermViewModel>;
};

const initialState: TermSliceState = {
    pagination: {
        page: 1,
        size: DEFAULT_PAGE_SIZE,
    },
};

export const termQueryOptionsSlice = createSlice({
    name: 'termQueryOptions',
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
        setFilters: (
            state,
            action: PayloadAction<{ filter: IUserDefinedFilter<ITermViewModel> }>
        ) => {
            state.filter = action.payload.filter;
        },
    },
});

export const { setPage, setPageSize, setFilters: setTermFilters } = termQueryOptionsSlice.actions;

export default termQueryOptionsSlice.reducer;
