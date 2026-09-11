import { ITermViewModel } from '@coscrad/api-interfaces';
import { createUserIndexQueryOptionsSlice } from '../../../shared/store/user-index-query-options-factory.slice';

export const termIndexQueryOptionsSlice =
    createUserIndexQueryOptionsSlice<ITermViewModel>('termIndexQueryOptions');

export const {
    setPaginationOptions: setTermPaginationOptions,
    setPageSize: setTermPageSize,
    setPage: setTermPage,
    setSearchString: setTermSearchString,
    setFilters: setTermFilters,
} = termIndexQueryOptionsSlice.actions;

export default termIndexQueryOptionsSlice.reducer;
