import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { resourceTypes } from 'apps/api/src/domain/types/resourceTypes';
import { Point } from '../../../../../models/spatial-feature/point.entity';
import InvalidEntityDTOError from '../../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
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
        expectedError: new InvalidEntityDTOError(resourceTypes.spatialFeature, validPointDTO.id),
    },
];
