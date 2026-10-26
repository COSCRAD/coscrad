import { ICategorizableIndexQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { RootState } from '../../../../store';
import { acquireIdApi } from '../../../id-generation/store';
import { FeedbackCommand, addFeedbackCommand, clearFeedbackState } from '../../../shared/store';
import { ApiCommandFsa } from '../../../shared/types';
import { triggerAlertWithError } from '../../../utils/trigger-alert-with-error';

type SpatialFeatureCommandFsa = {
    commandFsa: ApiCommandFsa;
};

export const spatialFeatureApi = createApi({
    reducerPath: 'spatial-feature',
    tagTypes: ['spatial-feature'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchSpatialFeatureById: builder.query<ISpatialFeatureViewModel, string>({
            query: (id: string) => `resources/spatialFeatures/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'spatial-feature', id } as const;

                return [tag];
            },
        }),
        fetchSpatialFeatures: builder.query<
            ICategorizableIndexQueryResult<ISpatialFeatureViewModel>,
            void
        >({
            query: () => ({
                url: `resources/spatialFeatures`,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.entities.map(({ id }) => ({
                              type: 'spatial-feature' as const,
                              id,
                          })),
                          { type: 'spatial-feature', id: 'LIST' },
                      ]
                    : [{ type: 'spatial-feature', id: 'LIST' }],
            keepUnusedDataFor: 300,
        }),
        executeSpatialFeatureCommand: builder.mutation<string, SpatialFeatureCommandFsa>({
            query: ({ commandFsa }: SpatialFeatureCommandFsa) => ({
                url: 'commands',
                method: 'POST',
                body: commandFsa,
                responseHandler: 'text',
            }),
            onQueryStarted: async (
                { commandFsa: { type: commandType, payload } }: SpatialFeatureCommandFsa,
                { dispatch, getState, queryFulfilled }
            ) => {
                console.log({ commandType });

                console.log({ payload });

                const spatialFeatureCommand: FeedbackCommand = {
                    command: {
                        commandType: commandType,
                        payload: payload,
                    },
                };

                dispatch(addFeedbackCommand(spatialFeatureCommand));

                try {
                    const { data: commandAcknowledgement } = await queryFulfilled;

                    if (commandAcknowledgement === 'Ack') {
                        console.log('command successful', commandType);

                        if (commandType === 'PUBLISH_RESOURCE') {
                            console.log('publishing spatial feature');

                            dispatch(spatialFeatureApi.util.invalidateTags(['spatial-feature']));

                            // This is the last command for the stream so we can clear the feedback
                            dispatch(clearFeedbackState());
                        }
                    }

                    dispatch(acquireIdApi.util.invalidateTags(['ids']));
                } catch (error) {
                    const state = getState() as RootState;

                    triggerAlertWithError(dispatch, state, error);
                }
            },
        }),
    }),
});

export const {
    useFetchSpatialFeatureByIdQuery,
    useFetchSpatialFeaturesQuery,
    useExecuteSpatialFeatureCommandMutation,
} = spatialFeatureApi;
