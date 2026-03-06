import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { PointCreated, PointCreatedPayload } from '../../../point/commands';

export const buildPointCreated = (
    payloadOverrides: PointCreatedPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PointCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(1),
        },
        lattitude: 54.2,
        longitude: 52.8,
        contemporaryName: new MultilingualTextItem({
            text: 'the club',
            languageCode: LanguageCode.English,
            role: MultilingualTextItemRole.original,
        }),
        description: 'this is where we hang out on vacation',
    };

    return new PointCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
