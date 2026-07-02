import { IVideoViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';

export const videoApi = createApi({
    reducerPath: 'videos',
    tagTypes: ['video'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/reources/` }),
    endpoints: (builder) => ({
        fetchVideoById: builder.query<Omit<IVideoViewModel, 'transcript' | 'notes'>, string>({
            query: (id: string) => `videos/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'video', id } as const;

                return [tag];
            },
        }),
    }),
});
