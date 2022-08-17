import { Point } from '../../../../../models/spatial-feature/point.entity';
import { GeometricFeatureType } from '../../../../../models/spatial-feature/types/GeometricFeatureType';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import { buildInvalidSpatialFeatureDtoError } from '../spatial-feature.domainModelValidatorTestCase';
import { getValidSpatialFeatureInstanceForTest } from '../utils/getValidSpatialFeatureInstanceForTest';

const validPointDTO = getValidSpatialFeatureInstanceForTest(GeometricFeatureType.point);

export const buildPointInvalidTestCases = (): DomainModelValidatorInvalidTestCase<Point>[] => [
    {
        description: 'one of the coordinates is a string',
        invalidDTO: {
            ...validPointDTO,
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [12, 'foo' as unknown as number],
            },
        },
        // TODO [https://www.pivotaltracker.com/story/show/183014405] Check inner errors
        expectedError: buildInvalidSpatialFeatureDtoError(validPointDTO.id, []),
    },
];
