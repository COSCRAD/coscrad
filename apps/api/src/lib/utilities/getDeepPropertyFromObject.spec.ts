import { getDeepPropertyFromObject } from './getDeepPropertyFromObject';

const assertCorrectResult = (object, propertyPath, expectedResult): void => {
    const result = getDeepPropertyFromObject(object, propertyPath);

    expect(result).toEqual(expectedResult);
};

describe(`getDeepPropertyFromObject`, () => {
    describe(`when the property is shallow`, () => {
        it(`should return the correct result`, () => {
            assertCorrectResult({ foo: 2, bar: 'hello' }, 'foo', 2);
        });
    });

    describe(`when the property is deep`, () => {
        describe(`when there is a defined value`, () => {
            it(`should return the expected value`, () => {
                assertCorrectResult({ foo: { bar: { baz: 2 } } }, 'foo.bar', { baz: 2 });
            });
        });

        describe(`when the top level property is undefined`, () => {
            it(`should return undefined`, () => {
                assertCorrectResult({ foo: { bar: [1, 2, 3] } }, 'yaz', undefined);
            });
        });

        describe(`when an intermediate level property is undefined`, () => {
            it(`should return undefined`, () => {
                assertCorrectResult(
                    { foo: { bar: [1, 2, 3], baz: { a: 1, b: 2, c: 3 } } },
                    'foo.who.a',
                    undefined
                );
            });
        });

        describe(`when the leaf-level property is undefined`, () => {
            it(`should return undefined`, () => {
                assertCorrectResult(
                    { foo: { bar: [1, 2, 3], baz: { a: 1, b: 2, c: 3 } } },
                    'foo.baz.d',
                    undefined
                );
            });
        });
    });
});
