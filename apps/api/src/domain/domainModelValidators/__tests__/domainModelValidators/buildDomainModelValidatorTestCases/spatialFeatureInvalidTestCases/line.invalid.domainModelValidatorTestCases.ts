import { Line } from '../../../../../models/spatial-feature/line.entity';
import { GeometricFeatureType } from '../../../../../models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../../errors/InvalidResourceDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
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
        expectedError: new InvalidResourceDTOError(ResourceType.spatialFeature, validLineDTO.id),
    },
];
