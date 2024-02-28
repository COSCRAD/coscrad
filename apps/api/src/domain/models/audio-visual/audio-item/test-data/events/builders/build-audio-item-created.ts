import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import {
    AudioItemCreated,
    AudioItemCreatedPayload,
} from '../../../commands/create-audio-item/transcript-created.event';

export const buildAudioItemCreated = (
    payloadOverrides: DeepPartial<AudioItemCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: AudioItemCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: buildDummyUuid(1),
        },
        name: 'audio item name',
        languageCodeForName: LanguageCode.Haida,
        mediaItemId: buildDummyUuid(2),
        lengthMilliseconds: 123345,
    };

    return new AudioItemCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
