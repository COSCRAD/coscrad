import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { TestEventStream } from '../../../../../test-data/events';
import { AggregateType } from '../../../../types/AggregateType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeometricFeatureType } from '../../types/GeometricFeatureType';
import { PointCreated } from '../commands';
import { PointCoordinates } from './point-coordinates.entity';
import { Point } from './point.entity';

const spatialFeatureId = buildDummyUuid(1);

const aggregateCompositeIdentifier = {
    type: AggregateType.spatialFeature,
    id: spatialFeatureId,
};

const pointName = 'the point';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationOfName = 'le pointe';

const translationLanguageCode = LanguageCode.French;

const lattitude = 87.7;

const longitude = 85.1;

const pointCreated = new TestEventStream().andThen<PointCreated>({
    type: 'POINT_CREATED',
    payload: {
        geometricFeature: {
            type: GeometricFeatureType.point,
            coordinates: PointCoordinates.fromTuple([lattitude, longitude]),
        },
        name: {
            text: pointName,
            languageCode: originalLanguageCode,
        },
    },
});

const pointNameTranslated = pointCreated.andThen<SpatialFeatureNameTranslated>({
    type: 'SPATIAL_FEATURE_NAME_TRANSLATED',
    payload: {
        translationItem: {
            languageCode: translationLanguageCode,
            text: translationOfName,
        },
    },
});

describe(`Point.fromEventHistory`, () => {
    describe(`when working with a point`, () => {
        describe(`when there is only a creation event (POINT_CREATED)`, () => {
            it(`should create a point with the expected state`, () => {
                const result = Point.fromEventHistory(
                    pointCreated.as(aggregateCompositeIdentifier),
                    spatialFeatureId
                );

                expect(result).toBeInstanceOf(Point);
            });
        });

        describe(`when a point's name has been translated`, () => {
            it(`should translate the points name`, () => {
                const eventHistory = pointNameTranslated.as(aggregateCompositeIdentifier);

                const result = Point.fromEventHistory(eventHistory, spatialFeatureId);

                expect(result).toBeInstanceOf(Point);

                const newName = (result as Point).getName();

                expect(newName.hasTranslation()).toBe(true);

                const translationItem = newName.getTranslation(
                    translationLanguageCode
                ) as MultilingualTextItem;

                expect(translationItem.role).toBe(MultilingualTextItemRole.freeTranslation);

                expect(translationItem.text).toBe(translationOfName);
            });
        });
    });
});
