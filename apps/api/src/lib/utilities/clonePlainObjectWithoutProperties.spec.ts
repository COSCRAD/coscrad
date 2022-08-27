import { clonePlainObjectWithoutProperties } from './clonePlainObjectWithoutProperties';

describe('clonePlainObjectWithoutProperty', () => {
    /**
     * Note that static type safety should prevent the user from calling
     * with a bogus property key.
     */
    describe('when the properties exist in the input object', () => {
        const inputsExpectedOutputsAndKeysToRemove: [
            Record<string, unknown>,
            Record<string, unknown>,
            string[]
        ][] = [
            [{ foo: 2 }, {}, ['foo']],
            [{ foo: [1, 2, 3], bar: 'hello', baz: 88 }, { foo: [1, 2, 3] }, ['bar', 'baz']],
            [{ foo: 456, bar: undefined, baz: null }, { foo: 456 }, ['bar', 'baz']],
            [{ foo: undefined, bar: 88 }, { foo: undefined }, ['bar']],
            [{ foo: null, bar: 123 }, { foo: null }, ['bar']],
        ];

        inputsExpectedOutputsAndKeysToRemove.forEach(
            ([input, expectedOutput, propertiesToRemove], index) => {
                describe(`test case: ${index}`, () => {
                    it('should return the expected output', () => {
                        const result = clonePlainObjectWithoutProperties(input, propertiesToRemove);

                        expect(result).toEqual(expectedOutput);

                        /**
                         * TODO [https://www.pivotaltracker.com/story/show/182693933] [test-coverage]
                         * Make this a deep check.
                         */
                        // We want equality by value but not by reference
                        expect(result).not.toBe(expectedOutput);
                    });
                });
            }
        );
    });
});
