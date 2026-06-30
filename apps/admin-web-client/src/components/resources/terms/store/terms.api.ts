import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';

export const termApi = createApi({
    reducerPath: 'terms',
    tagTypes: ['term'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/resources/` }),
    endpoints: (builder) => ({
        fetchTermById: builder.query<Omit<ITermViewModel, 'notes'>, string>({
            query: (id: string) => `terms/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'term', id } as const;

                return [tag];
            },
        }),
        fetchTerms: builder.query<IIndexQueryResult<ITermViewModel>, void>({
            // TODO inject user pagination and filter options
            query: () => ({
                url: `terms`,
                method: 'POST',
            }),
        }),
    }),
});

export const { useFetchTermByIdQuery, useFetchTermsQuery } = termApi;
