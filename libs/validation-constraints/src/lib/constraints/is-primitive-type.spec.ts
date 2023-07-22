import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
} from '../__tests__';
import { isPrimitiveType } from './is-primititve-type';

const primitives = [
    -22.3,
    -9,
    34,
    0,
    39405,
    Infinity,
    -Infinity,
    '',
    'hello world',
    null,
    undefined,
    true,
    false,
];

const anObject = {
    foo: 5,
    bar: ['a', 'b'],
    baz: {
        nestedFoo: 22,
    },
};

const anArrow = (x: number) => x + 1;

const anArray = [4, 55, 94];

const nonPrimitives = [anObject, anArrow, anArray];

describe(`isPrimitiveType`, () => {
    describe(`when the value is of primitive type`, () => {
        primitives.forEach((primitive) => {
            it(`should return true`, () => {
                assertConstraintSatisfiedForPredicate(isPrimitiveType)(primitive);
            });
        });
    });

    describe(`when the value is of a reference type`, () => {
        nonPrimitives.forEach((referenceValue) => {
            it(`should return false`, () => {
                assertConstraintFailsForPredicate(isPrimitiveType)(referenceValue);
            });
        });
    });
});
