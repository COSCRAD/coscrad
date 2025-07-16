import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { TermCompositeIdentifier } from '../create-term';
import { ProvideLiteralTranslationOfTerm } from './provide-literal-translation-of-term.command';

@CoscradDataExample<ProvideLiteralTranslationOfTerm>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.term,
            id: buildDummyUuid(1),
        },
        literalTranslation: 'me towards it (mushy) he throws',
        translationLanguageCode: LanguageCode.English,
    },
})
@Command({
    type: 'PROVIDE_LITERAL_TRANSLATION_OF_TERM',
    label: 'Provide Literal Translation',
    description:
        'provide a literal translation (as opposed to free) translation of a term into a second langauge',
})
export class LiteralTranslationOfTermProvidedPayload {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'composite ID (generated)',
        description: 'system-wide unique identifier for the new term',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NestedDataType(MultilingualTextItem, {
        label: 'translation item',
        description: 'the new multilingual text item associated with this translation',
    })
    translationItem: MultilingualTextItem;
}

const EVENT_TYPE = 'LITERAL_TRANSLATION_OF_TERM_PROVIDED';

const testEventId = buildDummyUuid(1);

@CoscradDataExample<LiteralTranslationOfTermProvided>({
    example: {
        type: 'LITERAL_TRANSLATION_OF_TERM_PROVIDED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(11),
            },
            translationItem: new MultilingualTextItem({
                text: 'he (1) spoke was it',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.literalTranslation,
            }),
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(2),
            dateCreated: dummyDateNow,
            contributorIds: [],
        },
    },
})
@CoscradEvent(EVENT_TYPE)
export class LiteralTranslationOfTermProvided extends BaseEvent<LiteralTranslationOfTermProvidedPayload> {
    readonly type = EVENT_TYPE;

    public static fromProvideLiteralTranslationOfTermCommand(
        {
            aggregateCompositeIdentifier,
            literalTranslation,
            translationLanguageCode,
        }: ProvideLiteralTranslationOfTerm,
        meta: EventRecordMetadata
    ) {
        const eventPayload: LiteralTranslationOfTermProvidedPayload = {
            aggregateCompositeIdentifier,
            translationItem: new MultilingualTextItem({
                text: literalTranslation,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.literalTranslation,
            }),
        };

        return new LiteralTranslationOfTermProvided(eventPayload, meta);
    }
}
