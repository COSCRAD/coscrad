import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PAGE_ADDED_TO_DIGITAL_TEXT } from '../../constants';
import { AddPageToDigitalText } from './add-page-to-digital-text.command';

export type PageAddedToDigitalTextPayload = AddPageToDigitalText;

const testEventId = buildDummyUuid(45);

@CoscradDataExample<PageAddedToDigitalText>({
    example: {
        id: testEventId,
        type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(5),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(4),
            },
            identifier: '55',
        },
    },
})
@CoscradEvent(PAGE_ADDED_TO_DIGITAL_TEXT)
export class PageAddedToDigitalText extends BaseEvent<PageAddedToDigitalTextPayload> {
    readonly type = PAGE_ADDED_TO_DIGITAL_TEXT;
}
