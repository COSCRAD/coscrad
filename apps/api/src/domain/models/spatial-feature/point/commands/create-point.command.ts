import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { FiniteNumber, FromDomainModel, NestedDataType, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateTypeProperty } from '../../../shared/common-commands';
import { SpatialFeatureProperties } from '../entities/spatial-feature-properties.entity';
import { CREATE_POINT } from './constants';

export class SpatialFeatureCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.spatialFeature])
    type = AggregateType.spatialFeature;

    @UUID({
        label: 'id',
        description: 'unique ID for this spatial feature',
    })
    id: AggregateId;
}

@Command({
    type: CREATE_POINT,
    label: 'Create Point',
    description: `Create a spatial feature with 2D Point geometry`,
})
export class CreatePoint implements ICommandBase {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier for this spatial feature',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    /**
     * TODO Restrict the range of this. We need to be careful when doing so.
     * References:
     * - [GEO JSON Pole definitions](https://datatracker.ietf.org/doc/html/rfc7946#section-5.3)
     * - [Lattitude (Wikipedia)](https://en.wikipedia.org/wiki/Latitude)
     *
     */
    @FiniteNumber({
        label: `lattitude`,
        description: 'lattitude',
    })
    readonly lattitude: number;

    /**
     * TODO Restrict the range of this
     * - [Longitude (Wikipedia)](https://en.wikipedia.org/wiki/Longitude)
     */
    @FiniteNumber({
        label: `longitude`,
        description: `longitude`,
    })
    readonly longitude: number;

    // TODO support elevation

    // TODO add languageCode for name
    @FromDomainModel(SpatialFeatureProperties)
    readonly name: string;

    @FromDomainModel(SpatialFeatureProperties)
    readonly description: string;

    @FromDomainModel(SpatialFeatureProperties)
    readonly imageUrl?: string;
}
