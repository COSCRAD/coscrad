import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { ISpatialFeature } from '../../../models/spatial-feature/ISpatialFeature';
import { Line } from '../../../models/spatial-feature/line.entity';
import { Point } from '../../../models/spatial-feature/point.entity';
import { Polygon } from '../../../models/spatial-feature/polygon.entity';
import { GeometricFeatureType } from '../../../models/spatial-feature/types/GeometricFeatureType';

export default (dto: PartialDTO<ISpatialFeature>): ISpatialFeature => {
    switch (dto.geometry.type) {
        case GeometricFeatureType.line:
            // TODO Remove Cast
            return new Line(dto as PartialDTO<Line>);

        case GeometricFeatureType.point:
            // TODO Remove Cast
            return new Point(dto as PartialDTO<Point>);

        case GeometricFeatureType.polygon:
            // TODO Remove Cast
            return new Polygon(dto as PartialDTO<Polygon>);

        default:
            throw new InternalError(
                `Cannot build Spatial Feature model with unsupported geometric feature type: ${dto.geometry.type}`
            );
    }
};
