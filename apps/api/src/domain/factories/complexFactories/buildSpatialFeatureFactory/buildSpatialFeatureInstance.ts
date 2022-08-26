import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Line } from '../../../models/spatial-feature/entities/line.entity';
import { Point } from '../../../models/spatial-feature/entities/point.entity';
import { Polygon } from '../../../models/spatial-feature/entities/polygon.entity';
import InvalidGeometryTypeForSpatialFeatureError from '../../../models/spatial-feature/errors/InvalidGeometryTypeForSpatialFeatureError';
import { ISpatialFeature } from '../../../models/spatial-feature/interfaces/spatial-feature.interface';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';

/**
 * We may want to introduce a `SpatialFeatureUnion` and strive for type safety \ narrowing here
 */
export default (dto: DTO<ISpatialFeature>): ResultOrError<ISpatialFeature> => {
    const type = dto?.geometry?.type;

    switch (type) {
        case GeometricFeatureType.line:
            return new Line(dto as DTO<Line>);

        case GeometricFeatureType.point:
            return new Point(dto as DTO<Point>);

        case GeometricFeatureType.polygon:
            return new Polygon(dto as DTO<Polygon>);

        default:
            return new InvalidGeometryTypeForSpatialFeatureError(type);
    }
};
