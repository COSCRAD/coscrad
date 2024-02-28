import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../../types/DeepPartial';
import { VideoNameTranslated, VideoNameTranslatedPayload } from '../../../commands';

export const buildVideoNameTranslated = (
    payloadOverrides: DeepPartial<VideoNameTranslatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: VideoNameTranslatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.video,
            id: buildDummyUuid(1),
        },
        text: 'translation of video name',
        languageCode: LanguageCode.English,
    };

    return new VideoNameTranslated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
