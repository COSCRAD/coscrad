import { AggregateType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import {
    AudioItemsImportedToPlaylist,
    AudioItemsImportedToPlaylistPayload,
} from '../../../commands/import-audio-items-to-playlist/audio-items-imported-to-playlist.event';

export const buildAudioItemsImportedToPlaylist = (
    payloadOverrides: AudioItemsImportedToPlaylistPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioItemsImportedToPlaylistPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.playlist,
            id: buildDummyUuid(1),
        },
        audioItemIds: [10, 11, 12].map(buildDummyUuid),
    };

    return new AudioItemsImportedToPlaylist(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
