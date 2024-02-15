import { InternalError } from '../../../lib/errors/InternalError';
import buildTestDataInFlatFormat from '../../../test-data/buildTestDataInFlatFormat';
import { SpatialFeature } from '../../models/spatial-feature/interfaces/spatial-feature.entity';
import {
    GeometricFeatureType,
    GeometricFeatureTypeToSpatialFeatureInstance,
} from '../../models/spatial-feature/types/GeometricFeatureType';
import { AggregateType } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';

export const getValidSpatialFeatureInstanceForTest = <
    TGeometricFeatureType extends GeometricFeatureType
>(
    geometryType: TGeometricFeatureType
): SpatialFeature => {
    // Find the first `Spatial Feature` model with this geometry type from the test data
    const searchResult = new DeluxeInMemoryStore(buildTestDataInFlatFormat())
        .fetchAllOfType(AggregateType.spatialFeature)
        .find(
            (
                spatialFeature: SpatialFeature
            ): spatialFeature is GeometricFeatureTypeToSpatialFeatureInstance[TGeometricFeatureType] =>
                spatialFeature.geometry.type === geometryType
        );

    /**
     * Just in case. We check that our test data is comprehensive for subtypes, so
     * we shouldn't hit this.
     **/
    if (!searchResult)
        throw new InternalError(
            `Test data missing for spatial feature with geometry type: ${geometryType}`
        );

    return searchResult;
};
