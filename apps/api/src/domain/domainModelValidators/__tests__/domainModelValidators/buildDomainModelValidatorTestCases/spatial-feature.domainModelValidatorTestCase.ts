import InvalidGeometryTypeForSpatialFeatureError from '../../../../models/spatial-feature/errors/InvalidGeometryTypeForSpatialFeatureError';
import { GeometricFeatureType } from '../../../../models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../../../types/ResourceType';
import NullOrUndefinedAggregateDTOError from '../../../errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import { buildLineInvalidTestCases } from './spatialFeatureInvalidTestCases/line.invalid.domainModelValidatorTestCases';
import { buildPointInvalidTestCases } from './spatialFeatureInvalidTestCases/point.invalid.domainModelValidatorTestCases';
import { buildPolygonInvalidTestCases } from './spatialFeatureInvalidTestCases/polygon.invalid.domainModelValidatorTestCases';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';
import { getValidSpatialFeatureInstanceForTest } from './utils/getValidSpatialFeatureInstanceForTest';

export const buildInvalidSpatialFeatureDtoError = buildInvariantValidationErrorFactoryFunction(
    ResourceType.spatialFeature
);

// Build one valid case per `GeometricFeatureType`
const validCases = Object.values(GeometricFeatureType).map((geometryType) => ({
    description: `When the geometry is of type: ${geometryType}`,
    dto: getValidSpatialFeatureInstanceForTest(geometryType).toDTO(),
}));

const modelSpecificTestCases = [
    ...buildPointInvalidTestCases(),
    ...buildLineInvalidTestCases(),
    ...buildPolygonInvalidTestCases(),
];

export const buildSpatialFeatureTestCase =
    (): DomainModelValidatorTestCase<ResourceType.spatialFeature> => ({
        resourceType: ResourceType.spatialFeature,
        validCases,
        invalidCases: [
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new NullOrUndefinedAggregateDTOError(ResourceType.spatialFeature),
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
                expectedError: buildInvalidSpatialFeatureDtoError(validCases[0].dto.id, [
                    new InvalidGeometryTypeForSpatialFeatureError('BOGUS-GEOMETRIC-FEATURE-TYPE'),
                ]),
            },
            ...modelSpecificTestCases,
        ],
    });
