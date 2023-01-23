import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isEnum } from './is-enum';

enum Planet {
    earth = 'Earth',
    mars = 'Mars',
    jupiter = 'Jupiter',
}

const validValues: Planet[] = Object.values(Planet);

const invalidValues = [
    'moon',
    '',
    'book',
    Math.PI,
    77.5,
    -77.5,
    3 / 8,
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

// Take Planet enum from the closure
const predicate = (input: unknown) => isEnum(Planet, input);

describe('isEnum', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(predicate);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(predicate);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
