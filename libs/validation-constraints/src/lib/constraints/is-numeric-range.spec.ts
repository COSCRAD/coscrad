import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNumericRange } from './is-numeric-range';

const validValues: [number, number][] = [
    [3.3, 3.3],
    [0, 5],
    [-102, 102],
    [-Infinity, Infinity],
    [-Infinity, 22],
    [-104.5, Infinity],
    [-4, 4],
];

const invalidValues: [number, number][] = [
    [6, 5],
    [102, -Infinity],
    [Infinity, -Infinity],
    [4, -4],
];

describe('isNumericRange', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNumericRange);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNumericRange);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
