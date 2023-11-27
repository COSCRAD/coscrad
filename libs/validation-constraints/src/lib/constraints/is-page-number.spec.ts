import {
    SHOULD_RETURN_THE_EXPECTED_RESULT,
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
} from '../__tests__';
import { isPageNumber } from './is-page-number';

const validValues = ['I', 'IV', '1', 'A.2', 'B-1', 'C_12', 'one'];

const invalidValues = [
    '', // empty strings are not allowed
    '   ', // white space only strings are also not allowed
    'A 2', // interior white space is not allowed
    '   a45', // leading white space is not allowed
    'b256   ', // trailing white space is not allowed
    '0123456789', // a page number cannot have more than 9 characters
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

describe(`isPageNumber`, () => {
    validValues.forEach((validValue) => {
        describe(`when the value: ${validValue} satisifes the constraint`, () => {
            const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isPageNumber);

            it.only(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                assertConstraintSatisfied(validValue);
            });
        });
    });

    invalidValues.forEach((invalidValue) => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isPageNumber);

        describe(buildInvalidCaseDescription(invalidValue), () => {
            it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                assertConstraintFailure(invalidValue);
            });
        });
    });
});
