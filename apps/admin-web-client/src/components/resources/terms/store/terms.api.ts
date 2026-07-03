import { IIndexQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { CommandFsa, CommandResponse } from '../../../shared/types';

export const termApi = createApi({
    reducerPath: 'terms',
    tagTypes: ['term'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchTermById: builder.query<ITermViewModel, string>({
            query: (id: string) => `resources/terms/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'term', id } as const;

                return [tag];
            },
        }),
        fetchTerms: builder.query<IIndexQueryResult<ITermViewModel>, void>({
            // TODO inject user pagination and filter options
            query: () => ({
                url: `resources/terms`,
                method: 'POST',
            }),
        }),
        translateTerm: builder.mutation<CommandResponse, CommandFsa, unknown>({
            query: (commandFsa) => ({
                url: 'commands',
                method: 'POST',
                responseHandler: 'text',
                body: commandFsa,
            }),
            invalidatesTags: ['term'],
        }),
    }),
});

export const { useFetchTermByIdQuery, useFetchTermsQuery, useTranslateTermMutation } = termApi;
