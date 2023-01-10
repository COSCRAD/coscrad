import { isNull } from '.';
import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';

// This is the only value that satisfies the constraint `isNull`
const validValue = null;

const invalidValues = [
    true,
    false,
    'hello world',
    'null',
    { foo: 'bar', baz: [2, 3, 4] },
    -300,
    299.5,
    ['A', 'B', 'C', 'D'],
    {},
    Infinity,
    -Infinity,
    NaN,
    [],
    '',
    0,
];

describe('isNull', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isNull);

        describe(buildValidCaseDescription(validValue), () => {
            it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                assertConstraintSatisfied(validValue);
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isNull);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
