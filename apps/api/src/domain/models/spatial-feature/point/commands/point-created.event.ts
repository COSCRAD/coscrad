import { FiniteNumber, FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SpatialFeatureProperties } from '../entities/spatial-feature-properties.entity';
import { SpatialFeatureCompositeIdentifier } from './create-point.command';

export class PointCreatedPayload {
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

    /**
     * Note that one of `traditionalName` and `contemporaryName` must be specified.
     */
    @NestedDataType(MultilingualTextItem, {
        label: 'traditional name',
        description: 'What was this place traditionally called by locals?',
        isOptional: true,
    })
    readonly traditionalName?: MultilingualTextItem;

    @NestedDataType(MultilingualTextItem, {
        label: 'contemporary-name',
        description: 'What is the contemporary (colonial) name for this place?',
        isOptional: true,
    })
    readonly contemporaryName?: MultilingualTextItem;

    @FromDomainModel(SpatialFeatureProperties)
    readonly description: string;

    @FromDomainModel(SpatialFeatureProperties)
    readonly imageUrl?: string;
}

@CoscradEvent('POINT_CREATED')
export class PointCreated extends BaseEvent<PointCreatedPayload> {
    readonly type = 'POINT_CREATED';
}
