import { Position2D } from 'apps/api/src/domain/models/spatial-feature/types/Coordinates/Position2D';
import isPointWithinBounds from './isPointWithinBounds';

type IndexAndPoint = {
    index: number;
    point: Position2D;
};

export default (
    line: Position2D[],
    [xBounds, yBounds]: [Position2D, Position2D]
): IndexAndPoint[] =>
    line.reduce(
        (accumulatedInvalidPoints: IndexAndPoint[], point, index) =>
            isPointWithinBounds(point, xBounds, yBounds)
                ? accumulatedInvalidPoints
                : accumulatedInvalidPoints.concat({
                      index,
                      point,
                  }),
        []
    );
