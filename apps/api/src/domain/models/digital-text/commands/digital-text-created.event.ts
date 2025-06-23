import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { CoscradEvent } from '../../../common';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { DIGITAL_TEXT_CREATED } from '../constants';
import { CreateDigitalText } from './create-digital-text.command';

export type DigitalTextCreatedPayload = CreateDigitalText;

@CoscradDataExample<DigitalTextCreated>({
    example: {
        id: buildDummyUuid(12),
        type: 'DIGITAL_TEXT_CREATED',
        meta: {
            id: buildDummyUuid(12),
            userId: buildDummyUuid(4321),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(9119),
                type: AggregateType.digitalText,
            },
            title: 'title of the digital text',
            languageCodeForTitle: LanguageCode.English,
        },
    },
})
@CoscradEvent(DIGITAL_TEXT_CREATED)
export class DigitalTextCreated extends BaseEvent<DigitalTextCreatedPayload> {
    readonly type = 'DIGITAL_TEXT_CREATED';
}
