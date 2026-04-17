import { AggregateType } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
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
    coordinates: GeometricFeature;

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
            name: 'the chill spot',
            description: 'the best place to relax',
            lattitude: 123,
            longitude: 321,
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
