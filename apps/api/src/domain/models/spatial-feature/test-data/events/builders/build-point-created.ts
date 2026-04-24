import { AggregateType, GeometricFeatureType } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { EventMetadataBuilder } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { PointCreated, PointCreatedPayload } from '../../../point/commands';

// TODO do we need this anymore?
export const buildPointCreated = (
    payloadOverrides: PointCreatedPayload,
    buildMetadata: EventMetadataBuilder
) => {
    const defaultPayload: PointCreatedPayload = {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(1),
        },
        location: { type: GeometricFeatureType.point, coordinates: [54.2, 52.8] },
        name: buildMultilingualTextWithSingleItem('the club').getOriginalTextItem(),
        description: buildMultilingualTextWithSingleItem(
            'this is where we hang out on vacation'
        ).getOriginalTextItem(),
    };

    return new PointCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
