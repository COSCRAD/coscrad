import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import { DeepPartial } from '../../../../../../types/DeepPartial';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { PhotographCreated, PhotographCreatedPayload } from '../../../commands';

export const buildPhotographCreated = (
    payloadOverrides: DeepPartial<PhotographCreatedPayload>,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PhotographCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.photograph,
            id: buildDummyUuid(1),
        },
        title: 'a nice picture',
        languageCodeForTitle: LanguageCode.English,
        heightPx: 900,
        widthPx: 1200,
        mediaItemId: buildDummyUuid(2),
    };

    return new PhotographCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
