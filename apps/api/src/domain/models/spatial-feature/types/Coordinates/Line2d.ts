import { Position2D } from './Position2D';

/**
 * A `Line2D` is a (possibly jagged- i.e. first order or higher discontinuities) line segment specified
 * by two or more 2D points. These points are connected (think "connect the dots")
 * in order of occurrence to generate a continuous line.
 */
export type Line2D = Position2D[];
