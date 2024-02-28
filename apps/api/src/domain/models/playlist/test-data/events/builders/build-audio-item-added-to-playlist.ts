import { AggregateType } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import {
    AudioItemAddedToPlaylist,
    AudioItemAddedToPlaylistPayload,
} from '../../../commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';

export const buildAudioItemAddedToPlaylist = (
    payloadOverrides: AudioItemAddedToPlaylistPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioItemAddedToPlaylistPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.playlist,
            id: buildDummyUuid(4),
        },
        audioItemId: buildDummyUuid(1),
    };

    return new AudioItemAddedToPlaylist(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
