import { ITermViewModel } from '@coscrad/api-interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DEFAULT_PAGE_SIZE } from '../../../shared/constants';

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
    pagination: {
        size: number;
        page: number;
    };
}

export type UserSearchString = string;

export type TermQueryOptionsState = {
    pagination: {
        page: number;
        size: number;
    };
    searchString?: UserSearchString;
    filter?: IUserDefinedFilter<ITermViewModel>;
};

const initialState: TermQueryOptionsState = {
    searchString: '',
    pagination: {
        page: 1,
        size: DEFAULT_PAGE_SIZE,
    },
};

export const termQueryOptionsSlice = createSlice({
    name: 'termQueryOptions',
    initialState,
    reducers: {
        setPaginationOptions: (state, action: PayloadAction<IUserPaginationOptions>) => {
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
            action: PayloadAction<{ filter: IUserDefinedFilter<ITermViewModel> | null }>
        ) => {
            state.filter = action.payload.filter;
        },
    },
});

export const {
    setPage,
    setPageSize,
    setFilters: setTermFilters,
    setSearchString: setTermSearchString,
} = termQueryOptionsSlice.actions;

export default termQueryOptionsSlice.reducer;
