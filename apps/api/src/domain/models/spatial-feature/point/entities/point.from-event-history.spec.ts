import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { TestEventStream } from '../../../../../test-data/events';
import { AggregateType } from '../../../../types/AggregateType';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { GeometricFeatureType } from '../../types/GeometricFeatureType';
import { PointCreated } from '../commands';
import { AlternativeNameAddedForSpatialFeature } from '../commands/add-alternative-name-for-spatial-feature/alternative-name-added-for-spatial-feature.event';
import { SpatialFeatureNameTranslated } from '../commands/translate-spatial-feature-name/spatial-feature-name-translated.event';
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
            it(`should translate the point's name`, () => {
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

        describe(`when an alternative name has been added for a point`, () => {
            const alternativeNameLabel = 'contemporary';

            const languageCodeForAlternativeName = LanguageCode.English;

            const alternativeNameText = 'Blue Mountain';

            it.only(`should add the alternative name`, () => {
                const result = Point.fromEventHistory(
                    pointCreated
                        .andThen<AlternativeNameAddedForSpatialFeature>(
                            {
                                type: 'ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE',
                                payload: {
                                    label: alternativeNameLabel,
                                    textItem: {
                                        languageCode: languageCodeForAlternativeName,
                                        text: alternativeNameText,
                                    },
                                },
                            },
                            // TODO can this be the first arg?
                            AlternativeNameAddedForSpatialFeature
                        )
                        .as(aggregateCompositeIdentifier),
                    spatialFeatureId
                );

                expect(result).toBeInstanceOf(Point);

                const { properties } = result as Point;

                const foundAlternativeName =
                    properties.alternativeNamesByLabel.get(alternativeNameLabel);

                const foundAlternativeNameText = foundAlternativeName?.getOriginalTextItem();

                expect(foundAlternativeNameText.text).toBe(alternativeNameText);

                expect(foundAlternativeNameText.languageCode).toBe(languageCodeForAlternativeName);
            });
        });
    });
});
