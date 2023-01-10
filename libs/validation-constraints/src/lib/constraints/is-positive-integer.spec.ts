import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isPositiveInteger } from './is-positive-integer';

const validValues: number[] = [1, 14, 300493, 2.998e8, 1995];

const invalidValues = [
    true,
    false,
    '1999',
    null,
    undefined,
    { foo: 'bar' },
    0,
    -300,
    Infinity,
    -Infinity,
    NaN,
    299.5,
    [1999, 2000, 2001],
];

describe('isPositiveInteger', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isPositiveInteger);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });
    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isPositiveInteger);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
