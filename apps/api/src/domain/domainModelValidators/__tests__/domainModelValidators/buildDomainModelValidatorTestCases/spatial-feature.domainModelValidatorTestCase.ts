import { GeometricFeatureType } from 'apps/api/src/domain/models/spatial-feature/types/GeometricFeatureType';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ISpatialFeature } from '../../../../models/spatial-feature/ISpatialFeature';
import { entityTypes } from '../../../../types/entityTypes';
import NullOrUndefinedDTOError from '../../../errors/NullOrUndefinedDTOError';
import spatialFeatureValidator from '../../../spatialFeatureValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';

const getValidSpatialFeatureInstanceForTest = (
    geometryType: GeometricFeatureType
): ISpatialFeature => {
    // Find the first `Spatial Feature` model with this geometry type from the test data
    const searchResult = buildTestData().spatialFeature.find(
        ({ geometry: { type } }) => type === geometryType
    );

    /**
     * Just to satisfy typeCheck. Technically, we don't check that a union
     * that fulfills a single `entityType` has one instance for every member
     * in our test data, so we could hit this once I suppose.
     */
    if (!searchResult)
        throw new InternalError(
            `Test data missing for spatial feature with geometry type: ${geometryType}`
        );

    return searchResult;
};

// Build one valid case per `GeometricFeatureType`
const validCases = Object.values(GeometricFeatureType).map((geometryType) => ({
    dto: getValidSpatialFeatureInstanceForTest(geometryType).toDTO(),
}));

export const buildSpatialFeatureTestCase = (): DomainModelValidatorTestCase<ISpatialFeature> => ({
    entityType: entityTypes.spatialFeature,
    validator: spatialFeatureValidator,
    validCases,
    invalidCases: [
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedDTOError(entityTypes.spatialFeature) as InternalError,
        },
    ],
});
