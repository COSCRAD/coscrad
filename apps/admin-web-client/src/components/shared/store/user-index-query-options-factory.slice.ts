import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../constants';
import {
    IUserDefinedFilter,
    IUserPaginationOptions,
    UserSearchString,
} from './user-index-query-options.slice';

export interface UserIndexQueryOptionsStateTBA<T> {
    pagination: IUserPaginationOptions;
    searchString?: UserSearchString;
    filter?: IUserDefinedFilter<T>;
}

export const createUserIndexQueryOptionsSlice = <T>(name: string) => {
    const initialState: UserIndexQueryOptionsStateTBA<T> = {
        searchString: '',
        pagination: {
            page: 1,
            size: DEFAULT_PAGE_SIZE,
        },
    };

    return createSlice({
        name,
        initialState,
        reducers: {
            setPaginationOptions: (
                state,
                action: PayloadAction<{ pagination: IUserPaginationOptions }>
            ) => {
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
            setSearchString: (state, action: PayloadAction<{ searchString: UserSearchString }>) => {
                state.searchString = action.payload.searchString;
            },
            setFilters: (
                state,
                action: PayloadAction<{ filter: IUserDefinedFilter<T> | null }>
            ) => {
                state.filter = action.payload.filter;
                state.pagination.page = 1;
            },
        },
    });
};
