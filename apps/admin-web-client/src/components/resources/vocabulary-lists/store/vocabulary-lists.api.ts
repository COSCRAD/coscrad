import {
    AggregateCompositeIdentifier,
    IIndexQueryResult,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';

type UnknownPart = Record<string, any>;

type VocabularyListCommandFsa = {
    type: string;
    payload: { aggregateCompositeIdentifier: AggregateCompositeIdentifier } & UnknownPart;
};

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
        // executeTermCommand: builder.mutation<string, TermCommandFsa>({
        //     query: (commandFsa) => ({
        //         url: `commands`,
        //         method: 'POST',
        //         body: commandFsa,
        //         responseHandler: 'text',
        //     }),
        //     onQueryStarted: async (
        //         { type: commandType, payload }: TermCommandFsa,
        //         { dispatch, queryFulfilled }
        //     ) => {
        //         const { data: commandAcknowledgement } = await queryFulfilled;

        //         let id = '';

        //         let commandPayload;

        //         if (commandType === 'CREATE_NOTE_ABOUT_RESOURCE') {
        //             commandPayload = payload as NotePayload;

        //             id = payload.resourceCompositeIdentifier.id;
        //         } else {
        //             commandPayload = payload as TranslationPayload;

        //             id = commandPayload.aggregateCompositeIdentifier.id;
        //         }

        //         if (commandAcknowledgement === 'Ack') {
        //             console.log('command successful', commandType);

        //             dispatch(
        //                 termApi.util.updateQueryData('fetchTermById', id, (draft) => {
        //                     const term = draft as ITermViewModel;

        //                     if (commandType === 'TRANSLATE_TERM') {
        //                         const {
        //                             name: { items },
        //                         } = term;

        //                         term.name.items = [
        //                             ...items,
        //                             {
        //                                 languageCode: commandPayload.languageCode,
        //                                 text: commandPayload.translation,
        //                                 role: MultilingualTextItemRole.freeTranslation,
        //                             },
        //                         ];
        //                     }

        //                     if (commandType === 'CREATE_NOTE_ABOUT_RESOURCE') {
        //                         const { notes } = term;

        //                         const noteId = commandPayload.aggregateCompositeIdentifier.id;

        //                         const newNote: IMultilingualTextRecord = {
        //                             original: {
        //                                 text: commandPayload.text,
        //                                 languageCode: commandPayload.languageCode,
        //                             },
        //                             translations: {},
        //                         };

        //                         term.notes = {
        //                             ...notes,
        //                             [noteId]: {
        //                                 id: noteId,
        //                                 context: commandPayload.resourceContext,
        //                                 note: newNote,
        //                             },
        //                         };
        //                     }
        //                 })
        //             );
        //         }
        //     },
        // }),
    }),
});

export const { useFetchVocabularyListsQuery, useFetchVocabularyListByIdQuery } = vocabularyListApi;
