import { ICategorizableIndexQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { ApiCommandFsa } from '../../../shared/types';

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
                { dispatch, queryFulfilled }
            ) => {
                const { data: commandAcknowledgement } = await queryFulfilled;

                if (commandAcknowledgement === 'Ack') {
                    console.log('command successful', commandType);
                    if (commandType === 'PUBLISH_RESOURCE') {
                        console.log('publishing spatial feature');

                        dispatch(spatialFeatureApi.util.invalidateTags(['spatial-feature']));
                    }
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
