import {
    AggregateCompositeIdentifier,
    IContributionSummary,
    IIndexQueryResult,
    IMultilingualTextRecord,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../../config';
import { RootState } from '../../../../store';
import { TermQueryOptionsState } from './term-query-options.slice';

export type AggregateId = string;

type UnknownPart = Record<string, any>;

type ContributionCacheUpdate = {
    speakerNames: string;
};

type TermCommandFsa = {
    type: string;
    payload: { aggregateCompositeIdentifier: AggregateCompositeIdentifier } & UnknownPart;
};

type TermCommandFsaWithOptions = {
    commandFsa: TermCommandFsa;
} & { options?: ContributionCacheUpdate };

type TermPayload = {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    text: string;
    languageCode: LanguageCode;
};

type TranslationPayload = {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    translation: string;
    languageCode: LanguageCode;
};

type AdditionalCreditsPayload = {
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    contributionType: string;
    contributorIds: AggregateId[];
};

// This is just a hack to satisfy the type when the client can't get the
// properties set on the server.  Date and timestamp are not displayed in
// the term presenters so these hack properties are not visible and not persisted
const buildTempContributionSummaryForCache = (
    speakersNames: string,
    commandPayload: AdditionalCreditsPayload
): IContributionSummary => {
    return {
        type: commandPayload.contributionType,
        statement: `${commandPayload.contributionType} by: ${speakersNames}`,
        contributorIds: commandPayload.contributorIds,
        timestamp: Date.now(),
        date: {
            year: 1000,
            month: 'November',
            day: 4,
        },
    };
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
        fetchTerms: builder.query<IIndexQueryResult<ITermViewModel>, TermQueryOptionsState>({
            // TODO inject user pagination and filter options
            query: (options) => ({
                url: `resources/terms`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(options),
            }),
            providesTags: (result) =>
                result
                    ? [
                          ...result.entities.map(({ id }) => ({ type: 'term' as const, id })),
                          { type: 'term', id: 'LIST' },
                      ]
                    : [{ type: 'term', id: 'LIST' }],
            keepUnusedDataFor: 300,
            onQueryStarted: async (arg, { getState }) => {
                console.log(`fetchTerms initiated`);
                const rootState = getState() as RootState;

                const termQueryOptions = rootState.termQueryOptions;

                console.log({ termQueryOptions });
            },
        }),
        executeTermCommand: builder.mutation<string, TermCommandFsaWithOptions>({
            query: ({ commandFsa }: TermCommandFsaWithOptions) => ({
                url: `commands`,
                method: 'POST',
                body: commandFsa,
                responseHandler: 'text',
            }),
            onQueryStarted: async (
                { commandFsa: { type: commandType, payload }, options }: TermCommandFsaWithOptions,
                { dispatch, queryFulfilled }
            ) => {
                const { data: commandAcknowledgement } = await queryFulfilled;

                let id = '';

                let commandPayload;

                switch (commandType) {
                    case 'CREATE_TERM':
                        commandPayload = payload as TermPayload;

                        break;

                    case 'CREATE_NOTE_ABOUT_RESOURCE':
                        commandPayload = payload as NotePayload;

                        id = payload.resourceCompositeIdentifier.id;

                        break;

                    case 'TRANSLATE_TERM':
                        commandPayload = payload as TranslationPayload;

                        id = commandPayload.aggregateCompositeIdentifier.id;

                        break;

                    case 'PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE':
                        commandPayload = payload as AdditionalCreditsPayload;

                        id = commandPayload.aggregateCompositeIdentifier.id;
                }

                if (commandAcknowledgement === 'Ack') {
                    console.log('command successful', commandType);

                    if (commandType === 'PUBLISH_RESOURCE') {
                        console.log('publishing term');

                        dispatch(termApi.util.invalidateTags(['term']));
                    } else {
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

                                if (commandType === 'PROVIDE_ADDITIONAL_CREDITS_FOR_RESOURCE') {
                                    const { contributions } = term;

                                    const { speakerNames } = options;

                                    const newContribution: IContributionSummary =
                                        buildTempContributionSummaryForCache(
                                            speakerNames,
                                            commandPayload
                                        );

                                    console.log({ newContribution });

                                    term.contributions = [...contributions, newContribution];
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
                }
            },
        }),
    }),
});

export const { useFetchTermByIdQuery, useFetchTermsQuery, useExecuteTermCommandMutation } = termApi;
