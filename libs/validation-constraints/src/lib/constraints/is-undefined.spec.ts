import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isUndefined } from './';

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

describe('isYear', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isUndefined);

        describe(buildValidCaseDescription(undefined), () => {
            it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                assertConstraintSatisfied(undefined);
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isUndefined);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValues), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
