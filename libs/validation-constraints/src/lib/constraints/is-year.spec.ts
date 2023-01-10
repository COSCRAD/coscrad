import { PredicateFunction } from '../types';
import { isYear } from './is-year';

type ActAndAssert = (input: unknown) => void;

const buildConstraintAssertion =
    (predicateFunction: PredicateFunction, expectedResult: boolean): ActAndAssert =>
    (value: unknown) => {
        const result = predicateFunction(value);

        expect(result).toBe(expectedResult);
    };

const validValues: number[] = [0, 100, 1493, 1864, 1995, 2000, 2022, 2023];

const invalidValues = [
    true,
    false,
    '1999',
    null,
    undefined,
    { foo: 'bar' },
    -300,
    299.5,
    [1999, 2000, 2001],
];

describe('isYear', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = buildConstraintAssertion(isYear, true);

        validValues.forEach((validValue) => {
            describe(`the valid value: ${validValue}`, () => {
                it(`should return true`, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });
    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = buildConstraintAssertion(isYear, false);

        invalidValues.forEach((invalidValue) => {
            describe(`the invalid value: ${invalidValue}`, () => {
                it('should return false', () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
