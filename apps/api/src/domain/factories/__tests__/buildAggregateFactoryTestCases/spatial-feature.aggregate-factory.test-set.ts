import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { formatGeometricFeatureType } from '../../../../view-models/presentation/formatGeometricFeatureType';
import { Line } from '../../../models/spatial-feature/entities/line.entity';
import { Point } from '../../../models/spatial-feature/entities/point.entity';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';
import { AggregateType } from '../../../types/AggregateType';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import { getValidSpatialFeatureInstanceForTest } from '../../../__tests__/utilities/getValidSpatialFeatureInstanceForTest';
import buildValidCasesForSubtypes from './common/buildValidCasesForSubtypes';

const aggregateType = AggregateType.spatialFeature;

const validPoint = getValidSpatialFeatureInstanceForTest(GeometricFeatureType.point);

const validLine = getValidSpatialFeatureInstanceForTest(GeometricFeatureType.line);

const validCases: AggregateFactoryValidTestCase<typeof aggregateType>[] =
    buildValidCasesForSubtypes(
        aggregateType,
        Object.values(GeometricFeatureType),
        formatGeometricFeatureType,
        getValidSpatialFeatureInstanceForTest
    );

const buildInvalidSpatialFeatureDtoError =
    buildInvariantValidationErrorFactoryFunction(aggregateType);

export const buildSpatialFeatureFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases,
    invalidCases: [
        /**
         * `Point` invalid test cases
         */
        {
            description: 'one of the coordinates is a string',
            dto: validPoint
                .clone<Point>({
                    geometry: {
                        type: GeometricFeatureType.point,
                        coordinates: [12, 'foo' as unknown as number],
                    },
                })
                .toDTO(),

            // TODO [https://www.pivotaltracker.com/story/show/183014405] Check inner errors
            checkError: (result: unknown) => {
                assertErrorAsExpected(
                    result,
                    buildInvalidSpatialFeatureDtoError(validPoint.id, [])
                );
            },
        },
        /**
         * `Line` invalid test cases
         */
        {
            description: 'one of the coordinates is a string',
            dto: validLine.clone<Line>({
                geometry: {
                    type: GeometricFeatureType.line,
                    coordinates: [
                        [3, 4],
                        [4, 5],
                        [12, 'foo' as unknown as number],
                        [9, 7],
                    ],
                },
            }),

            // TODO [https://www.pivotaltracker.com/story/show/183014405] Check inner errors
            checkError: (result: unknown) =>
                assertErrorAsExpected(result, buildInvalidSpatialFeatureDtoError(validLine.id, [])),
        },
    ],
});
