import { ICategorizableIndexQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { RootState } from '../../../../store';
import { acquireIdApi } from '../../../id-generation/store';
import {
    FeedBack,
    FeedbackCommand,
    FeedbackTypeEnum,
    addFeedbackCommand,
    showFeedBackMessageInSnackbar,
} from '../../../shared/store';
import { ApiCommandFsa } from '../../../shared/types';
import { transformApiError } from '../../../utils/transform-api-error';

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

                if (commandType === 'CREATE_POINT') {
                    console.log({ payload });

                    const createCommand: FeedbackCommand = {
                        command: {
                            commandType: commandType,
                            payload: payload,
                        },
                    };

                    dispatch(addFeedbackCommand(createCommand));
                }

                try {
                    const { data: commandAcknowledgement } = await queryFulfilled;

                    if (commandAcknowledgement === 'Ack') {
                        console.log('command successful', commandType);

                        if (commandType === 'PUBLISH_RESOURCE') {
                            console.log('publishing spatial feature');

                            dispatch(spatialFeatureApi.util.invalidateTags(['spatial-feature']));
                        }
                    }

                    dispatch(acquireIdApi.util.invalidateTags(['ids']));
                } catch (error) {
                    const state = getState() as RootState;

                    const commandPayloads = state?.feedbackSlice?.feedbackCommands;

                    console.log(
                        `Error attempting to submit spatial feature: ${JSON.stringify(
                            commandPayloads
                        )}`
                    );

                    const apiErrorMessage: string = transformApiError(error);

                    const feedback: FeedBack = {
                        severity: FeedbackTypeEnum.error,
                        title: 'Error - Adding Spatial Feature',
                        feedbackMessage: apiErrorMessage,
                    };

                    dispatch(showFeedBackMessageInSnackbar(feedback));
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
