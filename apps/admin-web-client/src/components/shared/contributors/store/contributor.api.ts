import { ICoscradContributorViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { TermQueryOptionsState } from '../../../resources/terms/store';

export interface ContributorsForTerm {
    id: string;
    label: string;
}

export const contributorApi = createApi({
    reducerPath: 'contributors',
    tagTypes: ['contributors'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchContributors: builder.query<
            IIndexQueryResult<ICoscradContributorViewModel>,
            TermQueryOptionsState
        >({
            query: (options) => ({
                url: `contributors`,
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(options),
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.entities.map(({ id }) => ({
                              type: 'contributors' as const,
                              id,
                          })),
                          { type: 'contributors', id: 'LIST' },
                      ]
                    : [{ type: 'contributors', id: 'LIST' }],
            keepUnusedDataFor: 300,
        }),
    }),
});

export const { useFetchContributorsQuery } = contributorApi;
