import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNonEmptyString } from './is-non-empty-string';

const foo = 'cool';

const validValues = ['Hello World', `I am so ${foo}`, '44.4444', 'Again-'.repeat(100)];

const invalidValues = [
    '', // empty strings are not allowed
    () => `I'm not a string!`,
    function leftOut() {
        return `How could you think I am a string?`;
    },
    Math.PI,
    {},
    44.4444,
    true,
    false,
    null,
    undefined,
    {},
    ['not', 'a', 'string'],
    Infinity,
    -Infinity,
    NaN,
];

describe('isNonEmptyString', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNonEmptyString);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNonEmptyString);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
