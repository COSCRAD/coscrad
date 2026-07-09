import {
    AggregateCompositeIdentifier,
    IIndexQueryResult,
    IMultilingualTextRecord,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';

type UnknownPart = Record<string, any>;

type TermCommandFsa = {
    type: string;
    payload: { aggregateCompositeIdentifier: AggregateCompositeIdentifier } & UnknownPart;
};

type TranslationPayload = {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    translation: string;
    languageCode: LanguageCode;
};

type NotePayload = {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    resourceCompositeIdentifier: AggregateCompositeIdentifier;
    text: string;
    languageCode: LanguageCode;
    resourceContext: { type: string };
};

export const termApi = createApi({
    reducerPath: 'terms',
    tagTypes: ['term'],
    baseQuery: fetchBaseQuery({ baseUrl: `${getConfig().apiUrl}/` }),
    endpoints: (builder) => ({
        fetchTermById: builder.query<ITermViewModel, string>({
            query: (id: string) => `resources/terms/${id}`,
            providesTags: (result, error, id) => {
                const tag = { type: 'term', id } as const;

                return [tag];
            },
        }),
        fetchTerms: builder.query<IIndexQueryResult<ITermViewModel>, void>({
            // TODO inject user pagination and filter options
            query: () => ({
                url: `resources/terms`,
                method: 'POST',
            }),
        }),
        executeTermCommand: builder.mutation<string, TermCommandFsa>({
            query: (commandFsa) => ({
                url: `commands`,
                method: 'POST',
                body: commandFsa,
                responseHandler: 'text',
            }),
            onQueryStarted: async (
                { type: commandType, payload }: TermCommandFsa,
                { dispatch, queryFulfilled }
            ) => {
                const { data: commandAcknowledgement } = await queryFulfilled;

                let id = '';

                let commandPayload;

                if (commandType === 'CREATE_NOTE_ABOUT_RESOURCE') {
                    commandPayload = payload as NotePayload;

                    id = payload.resourceCompositeIdentifier.id;
                } else {
                    commandPayload = payload as TranslationPayload;

                    id = commandPayload.aggregateCompositeIdentifier.id;
                }

                if (commandAcknowledgement === 'Ack') {
                    console.log('command successful', commandType);

                    dispatch(
                        termApi.util.updateQueryData('fetchTermById', id, (draft) => {
                            const term = draft as ITermViewModel;

                            if (commandType === 'TRANSLATE_TERM') {
                                const {
                                    name: { items },
                                } = term;

                                term.name.items = [
                                    ...items,
                                    {
                                        languageCode: commandPayload.languageCode,
                                        text: commandPayload.translation,
                                        role: MultilingualTextItemRole.freeTranslation,
                                    },
                                ];
                            }

                            if (commandType === 'CREATE_NOTE_ABOUT_RESOURCE') {
                                const { notes } = term;

                                const noteId = commandPayload.aggregateCompositeIdentifier.id;

                                const newNote: IMultilingualTextRecord = {
                                    original: {
                                        text: commandPayload.text,
                                        languageCode: commandPayload.languageCode,
                                    },
                                    translations: {},
                                };

                                term.notes = {
                                    ...notes,
                                    [noteId]: {
                                        id: noteId,
                                        context: commandPayload.resourceContext,
                                        note: newNote,
                                    },
                                };
                            }
                        })
                    );
                }
            },
        }),
    }),
});

export const { useFetchTermByIdQuery, useFetchTermsQuery, useExecuteTermCommandMutation } = termApi;
