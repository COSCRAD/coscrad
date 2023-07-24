import {
    assertConstraintFailsForPredicate,
    assertConstraintSatisfiedForPredicate,
} from '../__tests__';
import { doesDeepAnyPropertyEqual } from './does-deep-any-property-equal';

const objectToSearch = {
    numberAtTop: 22,
    stringAtTop: 'hi',
    booleanAtTop: true,
    nullAtTop: null,
    numberrrayAtTop: [1, 2, 3],
    stringArrayAtTop: ['a', 'b', 'c'],
    nested: {
        numberNested: 9,
        stringNested: 'hello',
        booleanNested: false,
        nullNested: null,
        undefinedNested: undefined,
        numberrrayNested: [101, 102, 103],
        stringArrayNested: ['a', 'b', 'c'],
    },
};

describe(`doesDeepAnyPropertyEqual`, () => {
    describe(`when the value to find is not a primitive type`, () => {
        [{ foo: 2 }, [1], () => 'hello world'].forEach((referenceTypeValue) => {
            describe(`value of type: ${typeof referenceTypeValue}`, () => {
                it(`should throw`, () => {
                    expect(() =>
                        doesDeepAnyPropertyEqual(referenceTypeValue)(objectToSearch)
                    ).toThrow();
                });
            });
        });
    });

    describe(`when the value to find is contained`, () => {
        describe(`when the value is contained on a top-level property`, () => {
            [22, 'hi', null].forEach((value) => {
                describe(`the value: ${value}`, () => {
                    it(`should return true`, () => {
                        assertConstraintSatisfiedForPredicate(doesDeepAnyPropertyEqual(value))(
                            objectToSearch
                        );
                    });
                });
            });
        });

        describe(`when the value is contained on a nested property`, () => {
            [9, 'hello', 101, 102, 103, 'a', 'b', 'c', undefined].forEach((value) => {
                describe(`the value: ${value}`, () => {
                    it(`should return true`, () => {
                        assertConstraintSatisfiedForPredicate(doesDeepAnyPropertyEqual(value))(
                            objectToSearch
                        );
                    });
                });
            });
        });
    });

    describe(`when the value to find is not contained`, () => {
        [9033, Infinity, -Infinity, 'not me', ''].forEach((value) => {
            describe(`value: ${value}`, () => {
                it(`should return false`, () => {
                    assertConstraintFailsForPredicate(doesDeepAnyPropertyEqual(value))(
                        objectToSearch
                    );
                });
            });
        });

        describe(`when the value is null`, () => {
            it(`should return false`, () => {
                // we use a different object to search that does not include a null value
                assertConstraintFailsForPredicate(doesDeepAnyPropertyEqual(null))({
                    foo: 22,
                    bar: { baz: 'hello world' },
                });
            });
        });
    });
});
