import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { TERM_TRANSLATED } from './constants';
import { TranslateTerm } from './translate-term.command';

export type TermTranslatedPayload = TranslateTerm;

// TODO Introduce an independent event payload and mapping layer
// export class TermTranslatedPayload {
//     aggregateCompositeIdentifier: TermCompositeIdentifier;

//     @NestedDataType(MultilingualTextItem, {
//         label: 'translation',
//         description: 'the text, language, and role (type) of the translation',
//     })
//     translation: MultilingualTextItem;
// }

const testEventId = buildDummyUuid(1);

@CoscradDataExample<TermTranslated>({
    example: {
        id: testEventId,
        type: 'TERM_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(192),
                type: AggregateType.term,
            },
            translation: 'In English it means, "roll it to me"',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(2),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent(TERM_TRANSLATED)
export class TermTranslated extends BaseEvent<TermTranslatedPayload> {
    readonly type = 'TERM_TRANSLATED';

    constructor(command: TranslateTerm, meta: EventRecordMetadata) {
        super(command, meta);
    }
}
