import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isObject } from './is-object';

const validValues = [
    {
        foo: undefined,
        bar: [1, 2, 3],
    },
    {
        baz: {
            names: ['Bub', 'Bob'],
        },
    },
    // empty objects are allowed
    {},
];

const invalidValues = [
    999.45,
    () => `I'm not an object by *this* definition`,
    function leftOut() {
        return `me neither`;
    },
    Math.PI,
    true,
    false,
    'hello Mars!',
    null,
    undefined,
    [1999, 2000, 2001], // Arrays do not satisfy this constraint
    Infinity,
    -Infinity,
    NaN,
];

describe('isObject', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isObject);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });
    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isObject);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
