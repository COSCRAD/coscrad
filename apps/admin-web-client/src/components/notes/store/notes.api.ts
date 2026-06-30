import { ITermViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';

export const noteApi = createApi({
    reducerPath: 'notes',
    tagTypes: ['note'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/resources/` }),
    endpoints: (builder) => ({
        fetchNotesAboutTerm: builder.query<Pick<ITermViewModel, 'notes'>, string>({
            query: (id: string) => `terms/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'note', id } as const;

                return [tag];
            },
        }),
    }),
});

export const { useFetchNotesAboutTermQuery } = noteApi;
