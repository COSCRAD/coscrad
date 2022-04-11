import { Point } from '../../domain/models/spatial-feature/point.entity';
import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { resourceTypes } from '../../domain/types/resourceTypes';
import { PartialDTO } from '../../types/partial-dto';

const pointCoordinates: Position2D[] = [
    [100.0, 0],
    [20.0, 10.0],
    [70.5, 23.5],
];

const dtos: PartialDTO<Point>[] = pointCoordinates.map((point, index) => ({
    id: `${index + 100}`,
    type: resourceTypes.spatialFeature,
    geometry: {
        type: GeometricFeatureType.point,

        coordinates: point,
    },
    published: true,
}));

export default (): Point[] => dtos.map((dto) => new Point(dto));
