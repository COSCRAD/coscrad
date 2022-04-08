import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import { ISpatialFeature } from '../../../../models/spatial-feature/ISpatialFeature';
import { entityTypes } from '../../../../types/entityTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import spatialFeatureValidator from '../../../spatialFeatureValidator';
import {
    DomainModelValidatorInvalidTestCase,
    DomainModelValidatorTestCase,
} from '../types/DomainModelValidatorTestCase';
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
    // TODO remove cast
] as unknown as DomainModelValidatorInvalidTestCase<ISpatialFeature>[];

export const buildSpatialFeatureTestCase = (): DomainModelValidatorTestCase<ISpatialFeature> => ({
    entityType: entityTypes.spatialFeature,
    validator: spatialFeatureValidator,
    validCases,
    invalidCases: [
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedDTOError(entityTypes.spatialFeature),
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
                entityTypes.spatialFeature,
                validCases[0].dto.id
            ),
        },
        ...modelSpecificTestCases,
    ],
});
