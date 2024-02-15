import { AggregateType } from '@coscrad/api-interfaces';
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
        name: 'the club',
        description: 'this is where we hang out on vacation',
    };

    return new PointCreated(
        clonePlainObjectWithOverrides(defaultPayload, payloadOverrides),
        buildMetadata()
    );
};
