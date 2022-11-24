import { Point } from '../../domain/models/spatial-feature/entities/point.entity';
import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const indexOffset = 100;

const pointCoordinates: Position2D[] = [
    [54.034404852745006, -132.17563335558532],
    [53.26710566708586, -131.99142447847115],
    [51.93152097800416, -123.14042112774867],
    [51.935065638350636, -122.50936316168337],
    [52.12579975880678, -123.68132823530952],
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
