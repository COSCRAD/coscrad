import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import { VideoCreated, VideoCreatedPayload } from '../../../commands';

export const buildVideoCreated = (
    payloadOverrides: DeepPartial<VideoCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: VideoCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.video,
            id: buildDummyUuid(1),
        },
        name: 'video name',
        languageCodeForName: LanguageCode.Haida,
        mediaItemId: buildDummyUuid(2),
        lengthMilliseconds: 123345,
    };

    return new VideoCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
