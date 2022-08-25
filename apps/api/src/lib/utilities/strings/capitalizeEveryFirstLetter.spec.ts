import capitalizeEveryFirstLetter from './capitalizeEveryFirstLetter';

type TestCase = {
    description: string;
    input: string;
    expectedOutput: string;
};

const testCases: TestCase[] = [
    {
        description: 'single word',
        input: 'foo',
        expectedOutput: 'Foo',
    },
    {
        description: 'several words',
        input: 'hello wonderful world',
        expectedOutput: 'Hello Wonderful World',
    },
    {
        description: 'empty string',
        input: '',
        expectedOutput: '',
    },
    {
        description: 'words already capitalized',
        input: 'Hello World',
        expectedOutput: 'Hello World',
    },
    {
        description: 'mixed casing to start',
        input: 'Hello my world',
        expectedOutput: 'Hello My World',
    },
    {
        description: 'includes a number',
        input: '3 little pigs',
        expectedOutput: '3 Little Pigs',
    },
];

describe(`capitalizeEveryFirstLetter`, () => {
    testCases.forEach(({ description, input, expectedOutput }) => {
        describe(description, () => {
            it('should return the expected output', () => {
                const result = capitalizeEveryFirstLetter(input);

                expect(result).toEqual(expectedOutput);
            });
        });
    });
});
