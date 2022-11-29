import { findFirstPoint } from './find-first-point';

describe('caclulateGeometricCentre', () => {
    describe('when the input is an empty array', () => {
        it('should return undefined', () => {
            const result = findFirstPoint([]);

            expect(result).toBeUndefined();
        });
    });

    describe('when the input is a point', () => {
        it('should simply return the point', () => {
            const input: [number, number] = [3.5, 3.9];

            const result = findFirstPoint(input);

            expect(result).toEqual(input);
        });
    });

    describe('when the input is a line', () => {
        it('should return the first point', () => {
            const firstPoint: [number, number] = [5.67, -8, 90455];

            const input: [number, number][] = [
                [...firstPoint],
                [3.45, 45.56],
                [1.9869, 393.456],
                [-105.555, 55.5],
            ];

            const result = findFirstPoint(input);

            expect(result).toEqual(firstPoint);
        });
    });

    describe('when the input is a multi-polygon', () => {
        it('should return the first point', () => {
            const firstPoint: [number, number] = [3.45, 45.56];

            const firstRing: [number, number][] = [
                [...firstPoint],
                [13.45, 46.5],
                [13.99, 48.456],
                [5.234, 48.77],
            ];

            const input: [number, number][][] = [
                firstRing,
                [
                    [1, 2],
                    [2, 5],
                    [9, 70],
                ],
            ];

            const result = findFirstPoint(input);

            expect(result).toEqual(firstPoint);
        });
    });
});
