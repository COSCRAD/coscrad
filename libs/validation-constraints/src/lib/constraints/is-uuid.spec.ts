import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isUUID } from './is-uuid';

const validValues: string[] = [
    '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    // TODO Add more valid examples to document \ test our use cases
];

const invalidValues = [
    true,
    false,
    '1999',
    null,
    undefined,
    { foo: 'bar' },
    -300,
    299.5,
    [1999, 2000, 2001],
];

describe('isURL', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isUUID);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });
    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isUUID);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
