import { ICoscradContributorViewModel } from '@coscrad/api-interfaces';
import { createUserIndexQueryOptionsSlice } from '../../../shared/store/user-index-query-options-factory.slice';

export const contributorIndexQueryOptionsSlice =
    createUserIndexQueryOptionsSlice<ICoscradContributorViewModel>('contributorIndexQueryOptions');

export const {
    setPaginationOptions: setContributorPaginationOptions,
    setPageSize: setContributorPageSize,
    setPage: setContributorPage,
    setSearchString: setContributorSearchString,
    setFilters: setContributorFilters,
} = contributorIndexQueryOptionsSlice.actions;

export default contributorIndexQueryOptionsSlice.reducer;
