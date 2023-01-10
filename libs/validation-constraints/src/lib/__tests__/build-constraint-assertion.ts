import { PredicateFunction } from '../types';

export type ActAndAssert = (input: unknown) => void;

export const buildConstraintAssertion =
    (predicateFunction: PredicateFunction, expectedResult: boolean): ActAndAssert =>
    (value: unknown) => {
        const result = predicateFunction(value);

        expect(result).toBe(expectedResult);
    };
