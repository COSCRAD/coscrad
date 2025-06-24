import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateDigitalTextTitle } from './translate-digital-text-title.command';

export type DigitalTextTitleTranslatedPayload = TranslateDigitalTextTitle;

const testEventId = buildDummyUuid(1001);

@CoscradDataExample<DigitalTextTitleTranslated>({
    example: {
        id: testEventId,
        type: 'DIGITAL_TEXT_TITLE_TRANSLATED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(4),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(3),
            },
            translation: 'translation of digital text title',
            languageCode: LanguageCode.English,
        },
    },
})
@CoscradEvent('DIGITAL_TEXT_TITLE_TRANSLATED')
export class DigitalTextTitleTranslated extends BaseEvent<DigitalTextTitleTranslatedPayload> {
    type = 'DIGITAL_TEXT_TITLE_TRANSLATED';
}
