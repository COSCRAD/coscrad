import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import buildDummyUuid from '../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

@Command({
    type: 'ADD_SPATIAL_FEATURE_TO_MAP',
    label: 'Add Spatial Feature to Map',
    description: 'add a spatial feature to this map',
})
@CoscradDataExample<AddSpatialFeatureToMap>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.spatialFeature,
            id: buildDummyUuid(1),
        },
        spatialFeatureId: buildDummyUuid(2),
    },
})
export class AddSpatialFeatureToMap implements ICommandBase {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @UUID({
        label: 'spatial feature id',
        description: 'identifies the spatial feature you are adding to the map',
    })
    spatialFeatureId: AggregateId;
}
