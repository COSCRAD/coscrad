import not from './not';

const isPositive = (x: number): boolean => x > 0;

const isShortArray = (a: unknown[]): boolean => a.length < 5;

describe('not', () => {
    describe('when given a boolean function that takes a single number', () => {
        describe('when the negation is true', () => {
            it('should return true', () => {
                const input = -100;

                // Sanity check that the original function works
                expect(isPositive(input)).toBe(false);

                expect(not(isPositive)(input)).toBe(true);
            });
        });

        describe('when the negation is false', () => {
            it('should return false', () => {
                const input = 44.4;

                // Sanity check that the original function works
                expect(isPositive(input)).toBe(true);

                expect(not(isPositive)(input)).toBe(false);
            });
        });
    });

    describe('when given a boolean function that takes an array', () => {
        describe('when the negation is true', () => {
            it('should return true', () => {
                const input = Array(100).fill(5);

                // Sanity check that the original function works
                expect(isShortArray(input)).toBe(false);

                expect(not(isShortArray)(input)).toBe(true);
            });
        });

        describe('when the negation is false', () => {
            it('should return false', () => {
                const input = ['hi', 'bye'];

                // Sanity check that the original function works
                expect(isShortArray(input)).toBe(true);

                expect(not(isShortArray)(input)).toBe(false);
            });
        });
    });
});
