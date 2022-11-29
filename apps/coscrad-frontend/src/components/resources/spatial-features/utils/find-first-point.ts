type Position2D = [number, number];

type GeometricCoordinates = Position2D | Position2D[] | Position2D[][];

/**
 * Returns the first point on a `Point`, `Line`, or `MultiPolygon`.
 *
 * Returns `undefind` if an empty array is passed in.
 *
 * Currently only supports a single ring as part of a multi-polygon.
 */
export const findFirstPoint = (coordinates: GeometricCoordinates): Position2D => {
    if (coordinates.length === 0) return undefined;

    const testElement = coordinates[0];

    // we have a point
    if (typeof testElement === 'number') return coordinates as Position2D;

    const nestedTestElement = testElement[0];

    if (typeof nestedTestElement === 'number') {
        // testElement's 0th member is a number so `testElement` is a point
        return testElement as Position2D;
    }

    return nestedTestElement;
};
