import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { ProvideLiteralTranslationOfTerm } from './provide-literal-translation-of-term.command';

// TODO attempt a mapping layer and put a full ML text item on the payload
export type LiteralTranslationOfTermProvidedPayload = ProvideLiteralTranslationOfTerm;

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
            literalTranslation: 'he (1) spoke was it',
            translationLanguageCode: LanguageCode.English,
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
}
