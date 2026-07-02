import { ITermViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { CommandFsa, CommandResponse } from '../../shared/types';

export const noteApi = createApi({
    reducerPath: 'notes',
    tagTypes: ['note'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchNotesAboutTerm: builder.query<Pick<ITermViewModel, 'notes'>, string>({
            query: (id: string) => `resources/terms/${id}`,
            providesTags: ['note'],
        }),
        createNoteAboutResource: builder.mutation<CommandResponse, CommandFsa, unknown>({
            query: (commandFsa) => ({
                url: 'commands',
                method: 'POST',
                responseHandler: 'text',
                body: commandFsa,
            }),
            invalidatesTags: ['note'],
        }),
    }),
});

export const { useFetchNotesAboutTermQuery, useCreateNoteAboutResourceMutation } = noteApi;
