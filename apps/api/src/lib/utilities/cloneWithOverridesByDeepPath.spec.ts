import { cloneWithOverridesByDeepPath } from './cloneWithOverridesByDeepPath';

const assertCorrectResult = (input: Object, propertyPath, overrideValue, expectedResult): void => {
    const result = cloneWithOverridesByDeepPath(input, propertyPath, overrideValue);

    expect(result).toEqual(expectedResult);
};

describe(`cloneWithOverridesByDeepPath`, () => {
    describe(`when the path is shallow`, () => {
        it(`should return the expected result`, () => {
            assertCorrectResult(
                { foo: { bar: { baz: 2 } }, message: 'hi' },
                'message',
                'bye',

                { foo: { bar: { baz: 2 } }, message: 'bye' }
            );
        });
    });

    describe(`when the path is deep`, () => {
        it(`should return the expected result`, () => {
            assertCorrectResult(
                { foo: { bar: { baz: 2 } }, message: 'hi' },
                'foo.bar.baz',
                5,

                { foo: { bar: { baz: 5 } }, message: 'hi' }
            );
        });
    });
});
