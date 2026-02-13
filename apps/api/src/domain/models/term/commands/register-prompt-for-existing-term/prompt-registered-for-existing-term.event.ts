import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { TermCompositeIdentifier } from '../create-term';

export class PromptRegisteredForExistingTermPayload {
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    text: string;

    languageCode: LanguageCode;
}

const testEventId = buildDummyUuid(5);

@CoscradDataExample<PromptRegisteredForExistingTerm>({
    example: {
        type: 'PROMPT_REGISTERED_FOR_EXISTING_TERM',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(3),
            },
            text: 'I am not fast',
            languageCode: LanguageCode.English,
        },
        meta: {
            userId: buildDummyUuid(76),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
@CoscradEvent('PROMPT_REGISTERED_FOR_EXISTING_TERM')
export class PromptRegisteredForExistingTerm extends BaseEvent<PromptRegisteredForExistingTermPayload> {
    readonly type = 'PROMPT_REGISTERED_FOR_EXISTING_TERM';
}
