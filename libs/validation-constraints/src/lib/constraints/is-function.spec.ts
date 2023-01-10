import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
    buildInvalidCaseDescription,
    buildValidCaseDescription,
    IT_SHOULD_RETURN_THE_EXPECTED_RESULT,
} from '../__tests__';
import { isFunction } from './is-function';

class Widget {
    sayWassup() {
        return `I am a method attached to an instance`;
    }
}

class Whatsit {
    sayHey = () => {
        return `I am a method attached to an instance via an arrow-valued field`;
    };
}

const validValues = [
    () => `I'm an arrow function`,
    function leftOut() {
        return `I am a named function`;
    },
    function () {
        return `I am an anonymous function`;
    },
    {
        sayHi: () => `I am a method, bound to a plain object via an arrow-valued property`,
    }.sayHi,
    {
        sayBye() {
            return `I am a method bound to a plain old object`;
        },
    }.sayBye,
    new Widget().sayWassup,
    new Whatsit().sayHey,
];

const invalidValues = [
    '() => `hello`',
    Math.PI,
    {},
    9999999.5,
    true,
    false,
    'hello Mars!',
    null,
    undefined,
    [{ blue: 32 }],
    Infinity,
    -Infinity,
    NaN,
];

describe('isFunction', () => {
    describe('when the value satisfies the constraint', () => {
        const assertConstraintSatisfied = assertConstraintSatisfiedForPredicate(isFunction);

        validValues.forEach((validValue) => {
            describe(buildValidCaseDescription(validValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintSatisfied(validValue);
                });
            });
        });
    });

    describe('when the value fails the constraint', () => {
        const assertConstraintFailure = assertConstraintFailsForPredicate(isFunction);

        invalidValues.forEach((invalidValue) => {
            describe(buildInvalidCaseDescription(invalidValue), () => {
                it(IT_SHOULD_RETURN_THE_EXPECTED_RESULT, () => {
                    assertConstraintFailure(invalidValue);
                });
            });
        });
    });
});
