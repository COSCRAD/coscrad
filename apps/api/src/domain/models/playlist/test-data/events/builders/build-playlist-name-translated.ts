import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import {
    PlaylistNameTranslated,
    PlaylistNameTranslatedPayload,
} from '../../../commands/translate-playlist-name/playlist-name-translated.event';

export const buildPlaylistNameTranslated = (
    payloadOverrides: PlaylistNameTranslatedPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PlaylistNameTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.playlist,
            id: buildDummyUuid(3),
        },
        languageCode: LanguageCode.English,
        text: 'this is the translation for playlist name',
    };

    return new PlaylistNameTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
