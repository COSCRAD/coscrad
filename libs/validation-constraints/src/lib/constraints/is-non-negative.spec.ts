import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNonNegative } from './is-non-negative';

const validValues: number[] = [0, -0, 1, 14, 300493, 2.998e8, 2022, 5106.77788, 2 / 3, Infinity];

const invalidValues = [-Infinity, NaN, -5.3e15, -22, -1];

describe('isNonNegative', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNonNegative);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNonNegative);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
