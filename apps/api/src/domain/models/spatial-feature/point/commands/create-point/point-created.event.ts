import { AggregateType, GeometricFeatureType } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { buildTestInstance, CoscradDataExample } from '../../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../../common';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../common/entities/multilingual-text';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { GeometricFeature } from '../../../Geometric-Feature';
import { PointCoordinates } from '../../entities/point-coordinates.entity';
import { SpatialFeatureCompositeIdentifier } from './create-point.command';

export class PointCreatedPayload {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier for this spatial feature',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    /**
     * We use this format to support generic geospatial indexing in the
     * query database. The event consumer requires no knowledge of this
     * event other than that it contains a `GeometricFeature` valued property.
     */
    @NestedDataType(GeometricFeature, {
        label: 'coordinates for this',
        description: 'a place where the coordinates are',
    })
    geometricFeature: GeometricFeature;

    @NestedDataType(MultilingualTextItem, {
        label: 'name for the spatial feature',
        description: 'the name of the given spatial feature',
    })
    name: MultilingualTextItem;

    readonly description: MultilingualTextItem;
}

const testEventId = buildDummyUuid(41);

@CoscradDataExample<PointCreated>({
    example: {
        id: testEventId,
        type: 'POINT_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.spatialFeature,
                id: buildDummyUuid(14),
            },
            name: buildMultilingualTextWithSingleItem(
                "Blake's Stomping Grounds"
            ).getOriginalTextItem(),
            description:
                buildMultilingualTextWithSingleItem('Formerly Called the 7').getOriginalTextItem(),
            geometricFeature: buildTestInstance(GeometricFeature, {
                type: GeometricFeatureType.point,
                coordinates: new PointCoordinates({
                    lattitude: 50.123,
                    longitude: -122.2,
                }),
            }),
        },
        meta: {
            userId: buildDummyUuid(444),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
@CoscradEvent('POINT_CREATED')
export class PointCreated extends BaseEvent<PointCreatedPayload> {
    readonly type = 'POINT_CREATED';
}
