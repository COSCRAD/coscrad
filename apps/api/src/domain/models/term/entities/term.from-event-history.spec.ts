import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotFound } from '../../../../lib/types/not-found';
import { TestEventStream } from '../../../../test-data/events/test-event-stream';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    RESOURCE_READ_ACCESS_GRANTED_TO_USER,
    ResourceReadAccessGrantedToUser,
} from '../../shared/common-commands';
import { AdditionalCreditsProvidedForResource } from '../../shared/common-commands/provide-additional-credits-for-resource/additional-credits-provided-for-resource.event';
import { ResourcePublished } from '../../shared/common-commands/publish-resource/resource-published.event';
import {
    AudioAddedForTerm,
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../commands';
import { PhotographAddedForTerm } from '../commands/add-image-for-term/photograph-added-for-term.event';
import { PROMPT_TERM_CREATED } from '../commands/create-prompt-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../commands/elicit-term-from-prompt/constants';
import { LiteralTranslationOfTermProvided } from '../commands/provide-literal-translation-of-term/literal-translation-of-term-provided.event';
import { TERM_TRANSLATED } from '../commands/translate-term/constants';
import { Term } from './term.entity';

const termId = buildDummyUuid(1);

const originalText = 'Text in Language';

const originalLanguageCode = LanguageCode.Chilcotin;

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: `TERM_CREATED`,
    payload: {
        text: originalText,
        languageCode: originalLanguageCode,
    },
});

const translationText = `Translation of term: ${termId}`;

const translationLanguageCode = LanguageCode.English;

const termTranslated = termCreated.andThen<TermTranslated>({
    type: TERM_TRANSLATED,
    payload: {
        translation: translationText,
        languageCode: translationLanguageCode,
    },
});

const promptText = 'how do you say, "clap!"';

const promptTermCreated = new TestEventStream().andThen<PromptTermCreated>({
    type: PROMPT_TERM_CREATED,
    payload: {
        text: promptText,
    },
});

const elicitedPromptTranslationText = 'clap (in language)';

const elicitationLanguageCode = LanguageCode.Haida;

const termElicitedFromPrompt = promptTermCreated.andThen<TermElicitedFromPrompt>({
    type: TERM_ELICITED_FROM_PROMPT,
    payload: {
        text: elicitedPromptTranslationText,
        languageCode: elicitationLanguageCode,
    },
});

const audioItemId = buildDummyUuid(50);

const audioAddedForTerm = termElicitedFromPrompt.andThen<AudioAddedForTerm>({
    type: 'AUDIO_ADDED_FOR_TERM',
    payload: {
        audioItemId,
        languageCode: elicitationLanguageCode,
    },
});

const userId = buildDummyUuid(777);

const eventsForOtherAggregateRoots = [
    ...audioAddedForTerm.as({
        type: AggregateType.term,
        // a different term
        id: buildDummyUuid(972),
    }),
    ...new TestEventStream()
        .andThen({
            type: `SONG_CREATED`,
        })
        .as({
            id: buildDummyUuid(143),
        }),
];

describe(`Term.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the term is an ordinary term (not a prompt term)`, () => {
            describe(`When there is a creation event`, () => {
                it(`should return the expected term`, () => {
                    const result = Term.fromEventHistory(
                        termCreated.as({
                            id: termId,
                        }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const { eventHistory } = result as Term;

                    expect(eventHistory).toHaveLength(1);
                });
            });

            describe(`when the term is created then adding a photograph to the term`, () => {
                it(`should add the photograph`, () => {
                    const photographId = buildDummyUuid(43);

                    const result = Term.fromEventHistory(
                        termCreated
                            .andThen<PhotographAddedForTerm>({
                                type: 'PHOTOGRAPH_ADDED_FOR_TERM',
                                payload: {
                                    aggregateCompositeIdentifier: { id: termId },
                                    photographId,
                                },
                            })
                            .as({
                                type: AggregateType.term,
                                id: termId,
                            }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const updatedTerm = result as Term;

                    expect(updatedTerm.photographId).toEqual(photographId);
                });
            });

            describe(`when the term is created then a literal translation is provided`, () => {
                it(`should add the literal translation`, () => {
                    const literalTranslation = 'say you in what way is this';

                    const result = Term.fromEventHistory(
                        termCreated
                            .andThen<LiteralTranslationOfTermProvided>({
                                type: 'LITERAL_TRANSLATION_OF_TERM_PROVIDED',
                                payload: {
                                    translationItem: new MultilingualTextItem({
                                        text: literalTranslation,
                                        languageCode: translationLanguageCode,
                                        role: MultilingualTextItemRole.literalTranslation,
                                    }),
                                },
                            })
                            .as({
                                type: AggregateType.term,
                                id: termId,
                            }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const { eventHistory } = result as Term;

                    expect(eventHistory).toHaveLength(2);

                    const { text: foundTranslationText, role: foundTranslationItemRole } = (
                        result as Term
                    ).text.getTranslation(translationLanguageCode) as MultilingualTextItem;

                    expect(foundTranslationText).toBe(literalTranslation);

                    expect(foundTranslationItemRole).toBe(
                        MultilingualTextItemRole.literalTranslation
                    );
                });
            });

            describe(`When a term is created then translated`, () => {
                it(`should return the appropriate term`, () => {
                    const result = Term.fromEventHistory(termTranslated.as({ id: termId }), termId);

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    const translationItemSearchResult =
                        term.text.getTranslation(translationLanguageCode);

                    expect(translationItemSearchResult).not.toBe(NotFound);

                    const { text: foundTranslationText } =
                        translationItemSearchResult as MultilingualTextItem;

                    expect(foundTranslationText).toBe(translationText);
                });
            });

            describe(`When a translated term is published`, () => {
                it(`should return the appropriate term`, () => {
                    const result = Term.fromEventHistory(
                        termTranslated
                            .andThen<ResourcePublished>({
                                type: `RESOURCE_PUBLISHED`,
                            })
                            .as({ type: AggregateType.term, id: termId }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const updatedTerm = result as Term;

                    expect(updatedTerm.published).toBe(true);
                });
            });

            describe(`when granting read access to a user`, () => {
                it(`should allow the user access`, () => {
                    const accessGrantedEvents = termTranslated
                        .andThen<ResourceReadAccessGrantedToUser>({
                            type: RESOURCE_READ_ACCESS_GRANTED_TO_USER,
                            payload: {
                                userId,
                            },
                        })
                        .as({
                            type: AggregateType.term,
                            id: termId,
                        });

                    const result = Term.fromEventHistory(accessGrantedEvents, termId);

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    expect(term.queryAccessControlList.canUser(userId)).toBe(true);
                });
            });

            /**
             * TODO move this test to a generic
             * `resource.from-event-history.spec.ts`
             */
            describe(`when additional (manual) credits have been added`, () => {
                it(`should return these credits`, () => {
                    const contributionType = 'Info added';

                    const contributorIds = [11, 12, 13].map(buildDummyUuid);

                    const additionalCreditsAddedEvents = termTranslated
                        .andThen<AdditionalCreditsProvidedForResource>({
                            type: 'ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE',
                            payload: {
                                contributionType,
                                contributorIds,
                            },
                        })
                        .as({
                            type: AggregateType.term,
                            id: termId,
                        });

                    const result = Term.fromEventHistory(additionalCreditsAddedEvents, termId);

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    expect(term.manualCredits).toHaveLength(1);
                });
            });
        });

        describe(`when the term is a prompt term`, () => {
            describe(`when the prompt term has been created`, () => {
                it(`should return the appropriate term`, () => {
                    const result = Term.fromEventHistory(
                        promptTermCreated.as({
                            id: termId,
                        }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    expect(term.id).toBe(termId);

                    expect(term.isPromptTerm).toBe(true);

                    const { text: foundPromptText, languageCode: foundPromptLanguageCode } =
                        term.text.getOriginalTextItem() as MultilingualTextItem;

                    expect(foundPromptText).toBe(promptText);

                    expect(foundPromptLanguageCode).toBe(LanguageCode.English);
                });
            });

            describe(`when a term has been elicited from a prompt`, () => {
                it(`should return the expected term`, () => {
                    const result = Term.fromEventHistory(
                        termElicitedFromPrompt.as({ id: termId }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    const elicitedTranslationItem = term.text.getTranslation(
                        elicitationLanguageCode
                    ) as MultilingualTextItem;

                    const { text: foundText, languageCode: foundLanguageCode } =
                        elicitedTranslationItem;

                    expect(foundText).toBe(elicitedPromptTranslationText);

                    expect(foundLanguageCode).toBe(elicitationLanguageCode);
                });
            });

            describe(`when audio is added`, () => {
                it(`should return the updated term`, () => {
                    const result = Term.fromEventHistory(
                        audioAddedForTerm.as({
                            type: AggregateType.term,
                            id: termId,
                        }),
                        termId
                    );

                    expect(result).toBeInstanceOf(Term);

                    const updatedTerm = result as Term;

                    expect(updatedTerm.getIdForAudioIn(elicitationLanguageCode)).toBe(audioItemId);
                });
            });

            describe(`When a prompted term is published`, () => {
                it(`should return the appropriate term`, () => {
                    const publishTermEvents = [
                        ...termElicitedFromPrompt
                            .andThen<ResourcePublished>({
                                type: `RESOURCE_PUBLISHED`,
                            })
                            .as({ type: AggregateType.term, id: termId }),
                        /**
                         * This test includes events targetting other
                         * aggregate roots to ensure they are not applied
                         */
                        ...eventsForOtherAggregateRoots,
                    ];

                    const result = Term.fromEventHistory(publishTermEvents, termId);

                    expect(result).toBeInstanceOf(Term);

                    const updatedTerm = result as Term;

                    expect(updatedTerm.published).toBe(true);
                });
            });

            describe(`when granting read access to a user`, () => {
                it(`should allow the user access`, () => {
                    const accessGrantedEvents = termElicitedFromPrompt
                        .andThen<ResourceReadAccessGrantedToUser>({
                            type: RESOURCE_READ_ACCESS_GRANTED_TO_USER,
                            payload: {
                                userId,
                            },
                        })
                        .as({
                            type: AggregateType.term,
                            id: termId,
                        });

                    const result = Term.fromEventHistory(accessGrantedEvents, termId);

                    expect(result).toBeInstanceOf(Term);

                    const term = result as Term;

                    expect(term.queryAccessControlList.canUser(userId)).toBe(true);
                });
            });
        });
    });

    describe(`when the event history is invalid`, () => {
        describe(`when there are no events for the term`, () => {
            const otherId = '999';

            const result = Term.fromEventHistory(
                termElicitedFromPrompt.as({ id: otherId }),
                termId
            );

            expect(result).toBe(NotFound);
        });

        describe(`when there is no creation event`, () => {
            const badEventStream = new TestEventStream().andThen<TermTranslated>({
                type: TERM_TRANSLATED,
            });

            it(`should throw (system error)`, () => {
                const act = () =>
                    Term.fromEventHistory(
                        badEventStream.as({
                            id: termId,
                        }),
                        termId
                    );

                expect(act).toThrow();
            });
        });

        describe(`when there is a broken event in the database`, () => {
            const invalidEventStream = termCreated.andThen<TermTranslated>({
                type: TERM_TRANSLATED,
                payload: {
                    translation: ['I am of the wrong type'] as unknown as string,
                },
            });

            it(`should return the expected error`, () => {
                const result = Term.fromEventHistory(invalidEventStream.as({ id: termId }), termId);

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });
});
