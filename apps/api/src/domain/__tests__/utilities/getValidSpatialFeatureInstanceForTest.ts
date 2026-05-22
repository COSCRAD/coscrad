import { buildTestInstance } from '../../../test-data/utilities';
import { ISpatialFeature } from '../../models/spatial-feature/interfaces/spatial-feature.interface';
import { Point } from '../../models/spatial-feature/point/entities/point.entity';
import { GeometricFeatureType } from '../../models/spatial-feature/types/GeometricFeatureType';

export const getValidSpatialFeatureInstanceForTest = <
    TGeometricFeatureType extends GeometricFeatureType
>(
    geometryType: TGeometricFeatureType
): ISpatialFeature => {
    if (geometryType === GeometricFeatureType.point) {
        return buildTestInstance(Point);
    }

    throw new Error(`Unsupported geometry type for test data: ${geometryType}`);
};
