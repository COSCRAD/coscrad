import { NestedDataType, UUID } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

export class SpatialFeatureAddedToMapPayload {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @UUID({
        label: 'id',
        description: 'id for the spatial feature',
    })
    readonly spatialFeatureId: AggregateId;
}

@CoscradEvent('SPATIAL_FEATURE_ADDED_TO_MAP')
export class SpatialFeatureAddedToMap extends BaseEvent<SpatialFeatureAddedToMapPayload> {
    readonly type = 'SPATIAL_FEATURE_ADDED_TO_MAP';
}
