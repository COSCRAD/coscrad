import { ICategorizableIndexQueryResult, INoteViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { RootState } from '../../../store';
import { acquireIdApi } from '../../id-generation/store';
import { transformApiError } from '../../utils/transform-api-error';
import {
    FeedBack,
    FeedbackCommand,
    FeedbackTypeEnum,
    addFeedbackCommand,
    showFeedBackMessageInSnackbar,
} from '../store';
import { ApiCommandFsa } from '../types/api-types';

type ConnectionCommandFsa = {
    commandFsa: ApiCommandFsa;
};

export const webOfKnowledgeApi = createApi({
    reducerPath: 'connection',
    tagTypes: ['connection'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchConnectionById: builder.query<INoteViewModel, string>({
            query: (id: string) => `webOfKnowledge/${id}`,
            providesTags: () => {
                const tag = { type: 'connection' } as const;

                return [tag];
            },
        }),
        fetchConnections: builder.query<ICategorizableIndexQueryResult<INoteViewModel>, void>({
            query: () => ({ url: `webOfKnowledge`, method: 'POST' }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.entities.map(({ id }) => ({
                              type: 'connection' as const,
                              id,
                          })),
                          { type: 'connection', id: 'LIST' },
                      ]
                    : [{ type: 'connection', id: 'LIST' }],
            keepUnusedDataFor: 300,
        }),
        executeEdgeConnectionCommand: builder.mutation<string, ConnectionCommandFsa>({
            query: ({ commandFsa }: ConnectionCommandFsa) => ({
                url: 'commands',
                method: 'POST',
                body: commandFsa,
                responseHandler: 'text',
            }),
            onQueryStarted: async (
                { commandFsa: { type: commandType, payload } }: ConnectionCommandFsa,
                { dispatch, getState, queryFulfilled }
            ) => {
                console.log({ commandType });

                if (commandType === 'CONNECT_RESOURCES_WITH_NOTE') {
                    console.log({ payload });

                    // Create helper?
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

                            dispatch(webOfKnowledgeApi.util.invalidateTags(['connection']));
                        }
                    }

                    dispatch(acquireIdApi.util.invalidateTags(['ids']));
                } catch (error) {
                    const state = getState() as RootState;

                    const commandPayloads = state?.feedbackSlice?.feedbackCommands?.map(
                        ({ command }) => command
                    );

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
    useFetchConnectionByIdQuery,
    useFetchConnectionsQuery,
    useExecuteEdgeConnectionCommandMutation,
} = webOfKnowledgeApi;
