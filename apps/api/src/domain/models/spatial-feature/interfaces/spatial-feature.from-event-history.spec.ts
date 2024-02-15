import { TestEventStream } from '../../../../test-data/events';
import { AggregateType } from '../../../types/AggregateType';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { PointCreated } from '../point/commands';
import { SpatialFeature } from './spatial-feature.entity';

const spatialFeatureId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.spatialFeature,
    id: spatialFeatureId,
};

const pointName = 'the point';

const lattitude = 87.7;

const longitude = 85.1;

const pointCreated = new TestEventStream().andThen<PointCreated>({
    type: 'POINT_CREATED',
    payload: {
        lattitude,
        longitude,
        name: pointName,
    },
});

describe(`SpatialFeature.fromEventHistory`, () => {
    describe(`when working with a point`, () => {
        describe(`when there is only a creation event (POINT_CREATED)`, () => {
            it(`should create a point with the expected state`, () => {
                const result = SpatialFeature.fromEventHistory(
                    pointCreated.as(aggregateCompositeIdentifier),
                    spatialFeatureId
                );

                expect(result).toBeInstanceOf(SpatialFeature);
            });
        });
    });
});
