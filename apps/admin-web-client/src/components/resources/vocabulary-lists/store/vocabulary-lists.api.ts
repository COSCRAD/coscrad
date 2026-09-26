import { IIndexQueryResult, IVocabularyListViewModel } from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';

const resourceEndpointUrl = 'resources/vocabularyLists';

export const vocabularyListApi = createApi({
    reducerPath: 'vocabulary-lists',
    tagTypes: ['vocabularyList'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchVocabularyListById: builder.query<IVocabularyListViewModel, string>({
            query: (id: string) => `${resourceEndpointUrl}/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'vocabularyList', id } as const;

                return [tag];
            },
        }),
        fetchVocabularyLists: builder.query<IIndexQueryResult<IVocabularyListViewModel>, void>({
            // TODO inject user pagination and filter options
            query: () => ({
                url: resourceEndpointUrl,
                method: 'GET',
            }),
        }),
    }),
});

export const { useFetchVocabularyListsQuery, useFetchVocabularyListByIdQuery } = vocabularyListApi;
