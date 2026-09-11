import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../constants';

interface ISimpleCondition<_T> {
    type: string;

    /**
     * Type safety is difficult here. It's not just `keyof T` that are supported
     * but also things like `contributions[*].statement`.
     */
    field: string;

    operator: string;

    params: unknown[];
}
interface IComplexUserDefinedFilter<T> {
    type: string;
    conditions: ISimpleCondition<T>[];
}

export const ALL_PROPERTIES_SEARCH_KEY = '__ALL-PROPERTIES-SEARCH-KEY__';

export type IndexSearchScope<T> = keyof T | typeof ALL_PROPERTIES_SEARCH_KEY;

export type IUserDefinedFilter<T> = IComplexUserDefinedFilter<T> | ISimpleCondition<T>;

export interface IUserPaginationOptions {
    size: number;
    page: number;
}

export type UserSearchString = string;

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
                state.pagination = action.payload.pagination;
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
                console.log({ setFilter: action.payload.filter });

                state.filter = action.payload.filter;
                state.pagination.page = 1;
            },
        },
    });
};
