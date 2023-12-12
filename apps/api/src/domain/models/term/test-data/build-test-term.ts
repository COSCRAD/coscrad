import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { isNotFound } from '../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { TestEventStream } from '../../../../test-data/events';
import { DTO } from '../../../../types/DTO';
import { DeepPartial } from '../../../../types/DeepPartial';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import {
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../commands';
import { PROMPT_TERM_CREATED } from '../commands/create-prompt-term/constants';
import { TERM_CREATED } from '../commands/create-term/constants';
import { TERM_ELICITED_FROM_PROMPT } from '../commands/elicit-term-from-prompt/constants';
import { TERM_TRANSLATED } from '../commands/translate-term/constants';
import { Term } from '../entities/term.entity';

type RequiredTermProperties = {
    aggregateCompositeIdentifier: { id: AggregateId };
    text: MultilingualText;
    isPromptTerm: boolean;
};

type TestTermDto = DeepPartial<DTO<Term>> & RequiredTermProperties;

const assertResultValid = (result: Maybe<ResultOrError<Term>>, id: AggregateId): void => {
    if (isInternalError(result)) {
        throw new InternalError(`failed to build a test term`, [result]);
    }

    if (isNotFound(result)) {
        throw new InternalError(
            `failed to build ${formatAggregateCompositeIdentifier({
                type: AggregateType.term,
                id,
            })} (creation event missing)`
        );
    }
};

const buildEventStreamForPromptTerm = (dto: TestTermDto): TestEventStream => {
    const { text } = dto;

    const multilingualText = new MultilingualText(text);

    const { text: originalText } = multilingualText.getOriginalTextItem();

    const promptTermCreated = new TestEventStream().andThen<PromptTermCreated>({
        type: PROMPT_TERM_CREATED,
        payload: {
            text: originalText,
        },
    });

    if (!multilingualText.hasTranslation()) return promptTermCreated;

    const elicitedTermEventStream = multilingualText.getTranslationLanguages().reduce(
        (eventStream, languageCode) =>
            eventStream.andThen<TermElicitedFromPrompt>({
                type: TERM_ELICITED_FROM_PROMPT,
                payload: {
                    text: (multilingualText.getTranslation(languageCode) as MultilingualTextItem)
                        .text,
                    languageCode,
                },
            }),
        promptTermCreated
    );

    return elicitedTermEventStream;
};

const buildPromptTerm = (dto: TestTermDto): Term => {
    const {
        aggregateCompositeIdentifier: { id },
    } = dto;

    const eventHistory = buildEventStreamForPromptTerm(dto).as({ id });

    const result = Term.fromEventHistory(eventHistory, id);

    assertResultValid(result, id);

    return result as Term;
};

const buildEventHistoryForTranslatedTerm = (dto: TestTermDto): TestEventStream => {
    const { text } = dto;

    const multilingualText = new MultilingualText(text);

    const { text: originalText, languageCode: originalLanguageCode } =
        multilingualText.getOriginalTextItem();

    const termCreated = new TestEventStream().andThen<TermCreated>({
        type: TERM_CREATED,
        payload: {
            text: originalText,
            languageCode: originalLanguageCode,
        },
    });

    if (!multilingualText.hasTranslation()) return termCreated;

    const termTranslatedEventStream = multilingualText.getTranslationLanguages().reduce(
        (eventStream, languageCode) =>
            eventStream.andThen<TermTranslated>({
                type: TERM_TRANSLATED,
                payload: {
                    translation: (
                        multilingualText.getTranslation(languageCode) as MultilingualTextItem
                    ).text,
                    languageCode,
                },
            }),
        termCreated
    );

    return termTranslatedEventStream;
};

const buildTranslatedTerm = (dto: TestTermDto): Term => {
    const {
        aggregateCompositeIdentifier: { id },
    } = dto;

    const eventHistory = buildEventHistoryForTranslatedTerm(dto).as({ id });

    const result = Term.fromEventHistory(eventHistory, id);

    assertResultValid(result, id);

    return result as Term;
};

/**
 * This helper allows one to use state-based reasoning to seed test data and yet
 * attain an event history that corroborates the story.
 */
export const buildTestTerm = (dto: TestTermDto): Term => {
    const { isPromptTerm } = dto;

    /**
     * I think we could jump to `buildEventHistoryForX` since the logic in `buildXTerm`
     * is the same outside of the event history.
     */
    if (isPromptTerm) return buildPromptTerm(dto);

    return buildTranslatedTerm(dto);
};
