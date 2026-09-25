import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

@Command({
    type: 'ADD_SPATIAL_FEATURE_TO_MAP',
    label: 'Add Spatial Feature to Map',
    description: 'add a spatial feature to map',
})
export class AddSpatialFeatureToMap implements ICommandBase {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @UUID({
        label: 'spatial feature id',
        description: 'id for the spatial feature',
    })
    spatialFeatureId: AggregateId;
}
