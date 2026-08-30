import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { RootState } from '../../../store';

export const acquireIdApi = createApi({
    reducerPath: 'aquireid',
    tagTypes: ['ids'],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getConfig().apiUrl}/`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.userAuthInfo.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    endpoints: (builder) => ({
        fetchId: builder.query<string, void>({
            query: () => ({
                url: 'ids',
                method: 'POST',
                responseHandler: 'text',
                // credentials: 'include',
            }),
        }),
    }),
});

export const { useLazyFetchIdQuery } = acquireIdApi;
