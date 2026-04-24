import { AggregateType, GeometricFeatureType } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { buildTestInstance, CoscradDataExample } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { GeometricFeature } from '../../Geometric-Feature';
import { SpatialFeatureCompositeIdentifier } from './create-point.command';

export class PointCreatedPayload {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier for this spatial feature',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NestedDataType(GeometricFeature, {
        label: 'coordinates for this',
        description: 'a place where the coordinates are',
    })
    location: GeometricFeature;

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
            location: buildTestInstance(GeometricFeature, {
                type: GeometricFeatureType.point,
                coordinates: [52.1322203, -122.145229],
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
