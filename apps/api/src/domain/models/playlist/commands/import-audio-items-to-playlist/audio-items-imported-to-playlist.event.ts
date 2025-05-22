import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ImportAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

export type AudioItemsImportedToPlaylistPayload = ImportAudioItemsToPlaylist;

const testEventId = buildDummyUuid(8);

@CoscradDataExample<AudioItemsImportedToPlaylist>({
    example: {
        type: 'AUDIO_ITEMS_IMPORTED_TO_PLAYLIST',
        id: testEventId,
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(7),
        },
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(6),
                type: AggregateType.playlist,
            },
            audioItemIds: [],
        },
    },
})
@CoscradEvent('AUDIO_ITEMS_IMPORTED_TO_PLAYLIST')
export class AudioItemsImportedToPlaylist extends BaseEvent<AudioItemsImportedToPlaylistPayload> {
    readonly type = 'AUDIO_ITEMS_IMPORTED_TO_PLAYLIST';
}
