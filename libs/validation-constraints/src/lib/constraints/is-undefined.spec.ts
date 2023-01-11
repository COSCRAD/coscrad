import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isUndefined } from './';

const validValue = undefined;

const invalidValues = [
    true,
    false,
    'hello world',
    null,
    { foo: 'bar', baz: [2, 3, 4] },
    -300,
    299.5,
    [1999, 2000, 2001],
    {},
];

describe('isUndefined', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isUndefined);

        describe(buildValidCaseDescription(validValue), () => {
            it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                assertConstraintSatisfied(validValue);
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isUndefined);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
