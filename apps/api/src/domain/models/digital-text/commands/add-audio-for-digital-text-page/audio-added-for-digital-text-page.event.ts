import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';

export type AudioAddedForDigitalTextPagePayload = AddAudioForDigitalTextPage;

const testEventId = buildDummyUuid(1);
@CoscradDataExample<AudioAddedForDigitalTextPage>({
    example: {
        id: testEventId,
        type: 'AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(3),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.digitalText,
                id: buildDummyUuid(2),
            },
            audioItemId: buildDummyUuid(6),
            languageCode: LanguageCode.Chilcotin,
            pageIdentifier: 'X',
        },
    },
})
@CoscradEvent(`AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`)
export class AudioAddedForDigitalTextPage extends BaseEvent<AudioAddedForDigitalTextPagePayload> {
    readonly type = `AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE`;
}
