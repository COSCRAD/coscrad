import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioItemToPlaylist } from './add-audio-item-to-playlist.command';

export type AudioItemAddedToPlaylistPayload = AddAudioItemToPlaylist;

@CoscradDataExample<AudioItemAddedToPlaylist>({
    example: {
        // TODO why is this duplicated here? (see meta)
        id: buildDummyUuid(1),
        type: 'AUDIO_ITEM_ADDED_TO_PLAYLIST',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.playlist,
                id: buildDummyUuid(102),
            },
            audioItemId: buildDummyUuid(456),
        },
        // Can we have a `buildTestEventMeta`?
        meta: {
            userId: buildDummyUuid(999),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: buildDummyUuid(1),
        },
    },
})
@CoscradEvent(`AUDIO_ITEM_ADDED_TO_PLAYLIST`)
export class AudioItemAddedToPlaylist extends BaseEvent<AddAudioItemToPlaylist> {
    readonly type = 'AUDIO_ITEM_ADDED_TO_PLAYLIST';

    /**
     * Is there any  magic we can do to put this on the `BaseEvent`?
     */
    public static fromDto({ payload, meta }: DTO<AudioItemAddedToPlaylist>) {
        return new AudioItemAddedToPlaylist(payload, meta);
    }
}
