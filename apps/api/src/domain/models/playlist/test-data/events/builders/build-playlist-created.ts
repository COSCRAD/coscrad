import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { PlaylistCreated, PlaylistCreatedPayload } from '../../../commands/playlist-created.event';

export const buildPlaylistCreated = (
    payloadOverrides: PlaylistCreatedPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PlaylistCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.playlist,
            id: buildDummyUuid(2),
        },
        name: 'Hot jams',
        languageCodeForName: LanguageCode.Chilcotin,
    };

    return new PlaylistCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
