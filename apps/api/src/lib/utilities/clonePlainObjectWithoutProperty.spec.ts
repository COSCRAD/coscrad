import clonePlainObjectWithoutProperty from './clonePlainObjectWithoutProperty';

describe('clonePlainObjectWithoutProperty', () => {
    describe('when there is no such property in the input object', () => {
        it('should return a new object that is equivalent to the original', () => {
            const input = {
                foo: 7,
                bar: 'whoa',
            };

            const result = clonePlainObjectWithoutProperty(input, 'bogus-property-name');

            expect(result).toEqual(input);

            // We do not want shared references.
            // TODO [test-coverage] make this a deep check
            expect(result).not.toBe(input);
        });
    });

    describe('when the property exists in the input object', () => {
        const inputsExpectedOutputsAndKeyToRemove: [
            Record<string, unknown>,
            Record<string, unknown>,
            string
        ][] = [
            [{ foo: 2 }, {}, 'foo'],
            [{ foo: [1, 2, 3], bar: 'hello' }, { foo: [1, 2, 3] }, 'bar'],
            [{ foo: 456, bar: undefined }, { foo: 456 }, 'bar'],
            [{ foo: undefined, bar: 88 }, { foo: undefined }, 'bar'],
        ];

        inputsExpectedOutputsAndKeyToRemove.forEach(
            ([input, expectedOutput, propertyName], index) => {
                describe(`test case: ${index}`, () => {
                    it('should return the expected output', () => {
                        const result = clonePlainObjectWithoutProperty(input, propertyName);

                        expect(result).toEqual(expectedOutput);

                        // We want equality by value but not by reference
                        expect(result).not.toBe(expectedOutput);
                    });
                });
            }
        );
    });
});
