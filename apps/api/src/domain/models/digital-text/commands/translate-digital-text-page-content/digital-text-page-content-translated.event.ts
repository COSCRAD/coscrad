import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslateDigitalTextPageContent } from './translate-digital-text-page-content.command';

export type DigitalTextPageContentTranslatedPayload = TranslateDigitalTextPageContent;

const testEventId = buildDummyUuid(39);
@CoscradDataExample<DigitalTextPageContentTranslated>({
    example: {
        id: testEventId,
        type: 'DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(6),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(5),
            },
            translation: 'translation of digital text page content',
            languageCode: LanguageCode.English,
            pageIdentifier: 'XV',
        },
    },
})
@CoscradEvent(`DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`)
export class DigitalTextPageContentTranslated extends BaseEvent<DigitalTextPageContentTranslatedPayload> {
    readonly type = `DIGITAL_TEXT_PAGE_CONTENT_TRANSLATED`;
}
