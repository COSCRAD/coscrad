import { Position2D } from '../../domain/models/spatial-feature/types/Coordinates/Position2D';
import formatPosition2D from './formatPosition2D';

export default ([xBounds, yBounds]: [Position2D, Position2D]): string =>
    `[${(formatPosition2D(xBounds), formatPosition2D(yBounds))}]`;
