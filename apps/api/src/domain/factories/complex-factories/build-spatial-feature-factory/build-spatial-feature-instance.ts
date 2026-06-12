import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import InvalidGeometryTypeForSpatialFeatureError from '../../../models/spatial-feature/errors/InvalidGeometryTypeForSpatialFeatureError';
import { ISpatialFeature } from '../../../models/spatial-feature/interfaces/spatial-feature.interface';
import { Point } from '../../../models/spatial-feature/point/entities/point.entity';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';

/**
 * We may want to introduce a `SpatialFeatureUnion` and strive for type safety \ narrowing here
 */
export default (dto: DTO<ISpatialFeature>): ResultOrError<ISpatialFeature> => {
    const type = dto?.geometry?.type;

    switch (type) {
        // case GeometricFeatureType.line:
        //     throw new NotImplementedException(
        //         `Spatial features with a Line geometry are not yet supported`
        //     );

        case GeometricFeatureType.point:
            return new Point(dto as DTO<Point>);

        // case GeometricFeatureType.polygon:
        //     throw new NotImplementedException(
        //         `Spatial features with a Line geometry are not yet supported`
        //     );

        default:
            return new InvalidGeometryTypeForSpatialFeatureError(type);
    }
};
