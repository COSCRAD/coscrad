import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNullOrUndefined } from './is-null-or-undefined';

const validValues = [null, undefined];

const invalidValues = [
    true,
    false,
    'I am not a nobody!',
    { foo: 'who' },
    0,
    [],
    '',
    {},
    6.02e23,
    Infinity,
    -Infinity,
    NaN,
    55,
    ['Hi', 'everybody'],
];

describe('isNullOrUndefined', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNullOrUndefined);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });
    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNullOrUndefined);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
