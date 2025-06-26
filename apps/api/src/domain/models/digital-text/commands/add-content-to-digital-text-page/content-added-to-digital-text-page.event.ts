import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddContentToDigitalTextPage } from './add-content-to-digital-text-page.command';

export type ContentAddedToDigitalTextPagePayload = AddContentToDigitalTextPage;

const eventType = 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE';

/**
 * TODO It seems that if event type is a constant we might be able to use reflection
 * to access this value on the prototype chain and avoid needing an argument
 * in the following decorator factory.
 */

const testEventId = buildDummyUuid(12);
@CoscradDataExample<ContentAddedToDigitalTextPage>({
    example: {
        id: testEventId,
        type: 'CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(5),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(6),
            },
            text: 'text for the page content',
            languageCode: LanguageCode.English,
            pageIdentifier: '66',
        },
    },
})
@CoscradEvent(eventType)
export class ContentAddedToDigitalTextPage extends BaseEvent<ContentAddedToDigitalTextPagePayload> {
    readonly type = eventType;
}
