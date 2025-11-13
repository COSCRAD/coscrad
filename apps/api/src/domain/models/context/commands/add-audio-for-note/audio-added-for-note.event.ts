import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioForNote } from './add-audio-for-note.command';

export type AudioAddedForNotePayload = AddAudioForNote;

const testEventId = buildDummyUuid(5);

@CoscradDataExample<AudioAddedForNote>({
    example: {
        id: testEventId,
        type: 'AUDIO_ADDED_FOR_NOTE',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(3),
                type: AggregateType.note,
            },
            audioItemId: buildDummyUuid(9),
            languageCode: LanguageCode.Chilcotin,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(7),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('AUDIO_ADDED_FOR_NOTE')
export class AudioAddedForNote extends BaseEvent<AudioAddedForNotePayload> {
    readonly type = 'AUDIO_ADDED_FOR_NOTE';
}
