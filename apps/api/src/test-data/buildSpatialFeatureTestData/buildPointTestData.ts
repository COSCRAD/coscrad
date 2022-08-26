import { Point } from '../../domain/models/spatial-feature/entities/point.entity';
import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const indexOffset = 100;

const pointCoordinates: Position2D[] = [
    [100.0, 0],
    [20.0, 10.0],
    [70.5, 23.5],
];

const dtos: DTO<Point>[] = pointCoordinates.map((point, index) => ({
    id: `${index + indexOffset}`,
    type: ResourceType.spatialFeature,
    geometry: {
        type: GeometricFeatureType.point,

        coordinates: point,
    },
    published: true,
}));

export default (): Point[] => dtos.map((dto) => new Point(dto));
