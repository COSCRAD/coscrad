import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNonNegativeFiniteNumber } from './is-non-negative-finite-number';

const validValues: number[] = [0, 1, 14, 300493, 2.998e8, 2022, 5106.77788, 2 / 3];

const invalidValues = [
    true,
    false,
    '1999',
    null,
    undefined,
    { foo: 'bar' },
    [1999, 2000, 2001],
    Infinity,
    -Infinity,
    NaN,
];

describe('isNonNegativeFiniteNumber', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied =
            assertConstraintSatisfiedForPredicate(isNonNegativeFiniteNumber);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure =
            assertConstraintFailsForPredicate(isNonNegativeFiniteNumber);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
