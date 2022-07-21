import {
    isPosition2D,
    Position2D,
} from '../../../domain/models/spatial-feature/types/Coordinates/Position2D';
import isFiniteNumber from '../../utilities/isFiniteNumber';
import isNumberWithinRange from './isNumberWithinRange';

/**
 * TODO Generalize this to points in N dimensions, N !== 2
 */
function isPointWithinBounds(
    [x, y]: Position2D,
    [xStart, xEnd]: Position2D,
    [yStart, yEnd]: Position2D
): boolean;

function isPointWithinBounds([x, y]: Position2D, xEnd: number, yEnd: number): boolean;

function isPointWithinBounds(
    [x, y]: Position2D,
    xBounds: number | Position2D,
    yBounds: number | Position2D
) {
    if (isFiniteNumber(xBounds) && isFiniteNumber(yBounds))
        return isNumberWithinRange(x, [0, xBounds]) && isNumberWithinRange(y, [0, yBounds]);

    if (isPosition2D(xBounds) && isPosition2D(yBounds))
        return isNumberWithinRange(x, xBounds) && isNumberWithinRange(y, yBounds);

    throw new Error(`Invalid arguments received for one of the bounds.`);
}

export default isPointWithinBounds;
