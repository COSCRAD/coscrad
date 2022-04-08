import { InternalError } from '../../../../../../lib/errors/InternalError';
import buildTestData from '../../../../../../test-data/buildTestData';
import { ISpatialFeature } from '../../../../../models/spatial-feature/ISpatialFeature';
import { GeometricFeatureType } from '../../../../../models/spatial-feature/types/GeometricFeatureType';

export const getValidSpatialFeatureInstanceForTest = (
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
