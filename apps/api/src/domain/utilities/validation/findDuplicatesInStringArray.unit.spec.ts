import findDuplicatesInStringArray from './findDuplicatesInStringArray';

type TestCase<T> = {
    description: string;
    input: T[];
    expectedOutput: T[];
};

const testCases: TestCase<string>[] = [
    {
        description: 'no duplicates',
        input: ['a', 'b', 'c'],
        expectedOutput: [],
    },
    {
        description: 'empty array',
        input: [],
        expectedOutput: [],
    },
    {
        description: 'every element occurs twice',
        input: ['foo', 'bar', 'baz', 'foo', 'bar', 'baz'],
        expectedOutput: ['foo', 'bar', 'baz'],
    },
    {
        description: 'several repeats for one element',
        input: ['blah', 'y', 'hah', 'y', 'mah', 'y', 'y', 'y'],
        expectedOutput: ['y'],
    },
];

describe('findDuplicatesInStringArray', () => {
    testCases.forEach(({ description, input, expectedOutput }) => {
        describe(description, () => {
            const result = findDuplicatesInStringArray(input);

            it('should return the expected output', () => {
                expect(result).toEqual(expectedOutput);
            });
        });
    });
});
