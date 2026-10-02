import { AggregateType } from '@coscrad/api-interfaces';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import buildDummyUuid from '../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../../domain/models/__tests__/utilities/dummyDateNow';
import { dummySystemUserId } from '../../../../../domain/models/__tests__/utilities/dummySystemUserId';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

export class SpatialFeatureAddedToMapPayload {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier to this map',
    })
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @UUID({
        label: 'id',
        description: 'identifies the spatial feature that has been added to this map',
    })
    readonly spatialFeatureId: AggregateId;
}

const dummyEventId = buildDummyUuid(105);

@CoscradDataExample<SpatialFeatureAddedToMap>({
    example: {
        type: 'SPATIAL_FEATURE_ADDED_TO_MAP',
        id: dummyEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.map,
                id: buildDummyUuid(1),
            },
            spatialFeatureId: buildDummyUuid(2),
        },
        meta: {
            id: dummyEventId,
            dateCreated: dummyDateNow,
            userId: dummySystemUserId,
        },
    },
})
@CoscradEvent('SPATIAL_FEATURE_ADDED_TO_MAP')
export class SpatialFeatureAddedToMap extends BaseEvent<SpatialFeatureAddedToMapPayload> {
    readonly type = 'SPATIAL_FEATURE_ADDED_TO_MAP';
}
