import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isNonEmptyObject } from './is-non-empty-object';

const validValues = [
    {
        foo: 22,
        bar: [1, 2, 3],
    },
    {
        baz: {
            smooth: 'jazz',
        },
    },
];

const invalidValues = [
    () => `I'm not an object by *this* definition`,
    function leftOut() {
        return `me neither`;
    },
    Math.PI,
    {},
    402.25,
    true,
    false,
    'hello Mars!',
    null,
    undefined,
    {},
    [1999, 2000, 2001],
    Infinity,
    -Infinity,
    NaN,
];

describe('isNonEmptyObject', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNonEmptyObject);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNonEmptyObject);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
