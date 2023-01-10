import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isFinite } from './is-finite';

const validValues: number[] = [
    -3.58e12,
    -333546,
    Math.PI,
    2 / 3,
    -5,
    -1,
    -0,
    0,
    1,
    2,
    3,
    100,
    9.2e5,
];

const invalidValues = [Infinity, -Infinity, NaN];

describe('isFinite', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isFinite);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isFinite);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
