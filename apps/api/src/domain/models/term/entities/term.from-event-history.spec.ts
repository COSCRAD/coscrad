import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { NotFound } from '../../../../lib/types/not-found';
import { TestEventStream } from '../../../../test-data/events/test-event-stream';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    RESOURCE_READ_ACCESS_GRANTED_TO_USER,
    ResourceReadAccessGrantedToUser,
} from '../../shared/common-commands';
import { ResourcePublished } from '../../shared/common-commands/publish-resource/resource-published.event';
import {
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../commands';
import { PROMPT_TERM_CREATED } from '../commands/create-prompt-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../commands/elicit-term-from-prompt/constants';
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

const userId = buildDummyUuid(777);

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

            describe(`When a translated term is pulbished`, () => {
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

            describe(`When a prompted term is pulbished`, () => {
                it(`should return the appropriate term`, () => {
                    const publishTermEvents = termElicitedFromPrompt
                        .andThen<ResourcePublished>({
                            type: `RESOURCE_PUBLISHED`,
                        })
                        .as({ type: AggregateType.term, id: termId });

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
});
