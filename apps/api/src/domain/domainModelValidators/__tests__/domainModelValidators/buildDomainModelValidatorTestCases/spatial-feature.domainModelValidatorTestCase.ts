import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { ISpatialFeature } from '../../../../models/spatial-feature/ISpatialFeature';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import NullOrUndefinedResourceDTOError from '../../../errors/NullOrUndefinedResourceDTOError';
import spatialFeatureValidator from '../../../spatialFeatureValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import { buildLineInvalidTestCases } from './spatialFeatureInvalidTestCases/line.invalid.domainModelValidatorTestCases';
import { buildPointInvalidTestCases } from './spatialFeatureInvalidTestCases/point.invalid.domainModelValidatorTestCases';
import { buildPolygonInvalidTestCases } from './spatialFeatureInvalidTestCases/polygon.invalid.domainModelValidatorTestCases';
import { getValidSpatialFeatureInstanceForTest } from './utils/getValidSpatialFeatureInstanceForTest';

// Build one valid case per `GeometricFeatureType`
const validCases = Object.values(GeometricFeatureType).map((geometryType) => ({
    description: `When the geometry is of type ${geometryType}`,
    dto: getValidSpatialFeatureInstanceForTest(geometryType).toDTO(),
}));

const modelSpecificTestCases = [
    ...buildPointInvalidTestCases(),
    ...buildLineInvalidTestCases(),
    ...buildPolygonInvalidTestCases(),
];

export const buildSpatialFeatureTestCase = (): DomainModelValidatorTestCase<ISpatialFeature> => ({
    resourceType: resourceTypes.spatialFeature,
    validator: spatialFeatureValidator,
    validCases,
    invalidCases: [
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedResourceDTOError(resourceTypes.spatialFeature),
        },
        {
            description: 'the dto has an invalid geometric spatial feature type',
            invalidDTO: {
                ...validCases[0].dto,
                geometry: {
                    ...validCases[0].dto.geometry,
                    type: 'BOGUS-GEOMETRIC-FEATURE-TYPE' as GeometricFeatureType,
                },
            },
            expectedError: new InvalidEntityDTOError(
                resourceTypes.spatialFeature,
                validCases[0].dto.id
            ),
        },
        ...modelSpecificTestCases,
    ],
});
