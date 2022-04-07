import { GeometricFeature } from '../../domain/models/spatial-feature/GeometricFeature';
import { Line } from '../../domain/models/spatial-feature/line.entity';
import { LineCoordinates } from '../../domain/models/spatial-feature/types/Coordinates/LineCoordinates';
import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import { GeometricFeatureType } from '../../domain/models/spatial-feature/types/GeometricFeatureType';

/**
 * TODO Add a little 'wiggle'
 */
const buildPointsInLine = (
    [startX, startY]: [number, number],
    slope: number,
    numberOfPoints: number
): Position2D[] =>
    Array(numberOfPoints)
        .fill(0)
        .map((_, index) => [startX + index, startY + slope * index]);

const buildLineGeometricFeature = (
    points: Position2D[]
): GeometricFeature<typeof GeometricFeatureType.line, LineCoordinates> => ({
    type: GeometricFeatureType.line,
    coordinates: points,
});

const pointSet1 = buildPointsInLine([35.0, 110.0], 2, 10);

export default () => [
    new Line({
        id: '223',
        geometry: buildLineGeometricFeature(pointSet1),
        published: true,
    }),
];
