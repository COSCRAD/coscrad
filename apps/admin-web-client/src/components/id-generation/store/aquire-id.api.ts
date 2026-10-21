import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { RootState } from '../../../store';
import { FeedBack, FeedbackTypeEnum, showFeedBackMessageInSnackbar } from '../../shared/store';
import { transformApiError } from '../../utils/transform-api-error';

export const acquireIdApi = createApi({
    reducerPath: 'aquireid',
    tagTypes: ['ids'],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getConfig().apiUrl}/`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth?.userAuthInfo?.token;

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
            onQueryStarted: async (_, { dispatch, queryFulfilled }) => {
                try {
                    const { data: newId } = await queryFulfilled;

                    console.log({ newId });
                } catch (error) {
                    console.log({ error });

                    const apiErrorMessage: string = transformApiError(error);

                    const feedback: FeedBack = {
                        severity: FeedbackTypeEnum.error,
                        title: 'Error - Retrieving Id for new record',
                        feedbackMessage: `${apiErrorMessage}`,
                    };

                    dispatch(showFeedBackMessageInSnackbar(feedback));
                }
            },
        }),
    }),
});

export const { useFetchIdQuery, useLazyFetchIdQuery } = acquireIdApi;
