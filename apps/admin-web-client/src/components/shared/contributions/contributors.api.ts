import { ICoscradContributorViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';

export interface ContributorsForTerm {
    id: string;
    label: string;
}

export const contributorsApi = createApi({
    reducerPath: 'contributors',
    tagTypes: ['contributors'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchContributors: builder.query<ContributorsForTerm[], void>({
            query: () => `contributors`,
            providesTags: ['contributors'],
            transformResponse: (
                response: IIndexQueryResult<ICoscradContributorViewModel>
            ): ContributorsForTerm[] => {
                const { entities } = response;

                const contributors = entities.map(({ id, fullName }) => ({
                    id: id,
                    label: fullName,
                }));

                return contributors;
            },
        }),
    }),
});

export const { useFetchContributorsQuery } = contributorsApi;
