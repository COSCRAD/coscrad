import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isFiniteNumber } from './is-finite-number';

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

const invalidValues = [
    Infinity,
    -Infinity,
    NaN,
    {},
    ['bob'],
    '44',
    { foo: { bar: 'baz' } },
    undefined,
    null,
    '',
];

describe('isFiniteNumber', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isFiniteNumber);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isFiniteNumber);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
