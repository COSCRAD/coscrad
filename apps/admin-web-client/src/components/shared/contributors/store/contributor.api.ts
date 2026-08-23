import { ICoscradContributorViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';

export interface ContributorsForTerm {
    id: string;
    label: string;
}

export const contributorApi = createApi({
    reducerPath: 'contributors',
    tagTypes: ['contributors'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchContributors: builder.query<IIndexQueryResult<ICoscradContributorViewModel>, void>({
            query: () => `contributors`,
            providesTags: ['contributors'],
        }),
    }),
});

export const { useFetchContributorsQuery } = contributorApi;
