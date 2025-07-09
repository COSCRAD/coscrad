import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForDigitalTextTitle } from './add-audio-for-digital-text-title.command';

const eventType = `AUDIO_ADDED_FOR_DIGITAL_TEXT_TITLE`;

export type AudioAddedForDigitalTextTitlePayload = AddAudioForDigitalTextTitle;

const testEventId = buildDummyUuid(2);

@CoscradDataExample<AudioAddedForDigitalTextTitle>({
    example: {
        id: testEventId,
        type: eventType,
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(6),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(3),
            },
            audioItemId: buildDummyUuid(7),
            languageCode: LanguageCode.Chilcotin,
        },
    },
})
@CoscradEvent(eventType)
export class AudioAddedForDigitalTextTitle extends BaseEvent<AudioAddedForDigitalTextTitlePayload> {
    readonly type = eventType;
}
