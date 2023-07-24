import { deepStringReplace } from './deep-string-replace';

const oldValue = 'eng';

const newValue = 'en';

describe(`deepStringReplace`, () => {
    describe(`when there is a shallow replacement to be made`, () => {
        it(`should return the expected value`, () => {
            const result = deepStringReplace(oldValue, newValue, { foo: 'eng' });

            expect(result).toEqual({
                foo: newValue,
            });
        });
    });

    describe(`when there is a deep replacement to be made on a nested object-valued prop`, () => {
        const input = {
            foo: 22,
            bar: {
                baz: oldValue,
                // If we include this, we get the `serializes to same string` result from Jest. We'll need better matchers.
                // yaz: () => `hello world`,
            },
        };

        const expectedResult = {
            foo: 22,
            bar: {
                baz: newValue,
                // yaz: () => `hello world`,
            },
        };

        const result = deepStringReplace(oldValue, newValue, input);

        it(`should return the expected result`, () => {
            expect(result).toEqual(expectedResult);
        });
    });

    describe(`when there is a deep replacement to be made on a nested array-valued prop`, () => {
        const input = {
            foo: 22,
            bar: {
                baz: ['a', 'b', oldValue],
                // If we include this, we get the `serializes to same string` result from Jest. We'll need better matchers.
                // yaz: () => `hello world`,
            },
        };

        const expectedResult = {
            foo: 22,
            bar: {
                baz: ['a', 'b', newValue],
                // yaz: () => `hello world`,
            },
        };

        const result = deepStringReplace(oldValue, newValue, input);

        it(`should return the expected result`, () => {
            expect(result).toEqual(expectedResult);
        });
    });

    describe(`when the input is a string array`, () => {
        const input = ['arf', 'ruff', oldValue, 'bark'];

        const expectedResult = ['arf', 'ruff', newValue, 'bark'];

        it(`should return the expected result`, () => {
            const result = deepStringReplace(oldValue, newValue, input);

            expect(result).toEqual(expectedResult);
        });
    });

    describe(`when the input is a string`, () => {
        describe(`when it matches the value to replace`, () => {
            const input = oldValue;

            it(`should return the updated value`, () => {
                const result = deepStringReplace(oldValue, newValue, input);

                expect(result).toBe(newValue);
            });
        });

        describe(`when it doesn't match the value to replace`, () => {
            const input = `foo`;

            it(`should return the original value`, () => {
                const result = deepStringReplace(oldValue, newValue, input);

                expect(result).toBe(input);
            });
        });
    });

    describe(`when the input is a non-string, primitive value`, () => {
        [null, undefined, true, false, 823.4].forEach((input) => {
            describe(`type: ${typeof input}`, () => {
                it(`should return the input`, () => {
                    const result = deepStringReplace(oldValue, newValue, input);

                    expect(result).toBe(input);
                });
            });
        });
    });
});
