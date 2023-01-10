import { PredicateFunction } from '../types';

export type ActAndAssert<T = unknown> = (input: T) => void;

export const buildConstraintAssertion =
    <T = unknown>(
        predicateFunction: PredicateFunction<T>,
        expectedResult: boolean
    ): ActAndAssert<T> =>
    (value: T) => {
        const result = predicateFunction(value);

        expect(result).toEqual(expectedResult);
    };
