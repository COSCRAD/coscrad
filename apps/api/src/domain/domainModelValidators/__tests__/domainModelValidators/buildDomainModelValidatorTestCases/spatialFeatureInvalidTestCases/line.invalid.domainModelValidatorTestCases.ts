import { Line } from '../../../../../models/spatial-feature/line.entity';
import { GeometricFeatureType } from '../../../../../models/spatial-feature/types/GeometricFeatureType';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import { buildInvalidSpatialFeatureDtoError } from '../spatial-feature.domainModelValidatorTestCase';
import { getValidSpatialFeatureInstanceForTest } from '../utils/getValidSpatialFeatureInstanceForTest';

const validLineDTO = getValidSpatialFeatureInstanceForTest(GeometricFeatureType.line);

export const buildLineInvalidTestCases = (): DomainModelValidatorInvalidTestCase<Line>[] => [
    {
        description: 'one of the coordinates is a string',
        invalidDTO: {
            ...validLineDTO,
            geometry: {
                type: GeometricFeatureType.line,
                coordinates: [
                    [3, 4],
                    [4, 5],
                    [12, 'foo' as unknown as number],
                    [9, 7],
                ],
            },
        },
        // TODO [https://www.pivotaltracker.com/story/show/183014405] Check inner errors
        expectedError: buildInvalidSpatialFeatureDtoError(validLineDTO.id, []),
    },
];
