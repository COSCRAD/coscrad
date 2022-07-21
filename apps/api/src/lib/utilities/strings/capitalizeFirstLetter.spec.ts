import capitalizeFirstLetter from './capitalizeFirstLetter';

type TestCase = {
    description: string;
    input: string;
    expectedOutput: string;
};

const testCases: TestCase[] = [
    {
        description: 'the empty string',
        input: '',
        expectedOutput: '',
    },
    {
        description: 'a single letter',
        input: 'a',
        expectedOutput: 'A',
    },
    {
        description: 'a single word',
        input: 'hello',
        expectedOutput: 'Hello',
    },
    {
        description: 'multiple words',
        input: 'hello to this universe',
        expectedOutput: 'Hello to this universe',
    },
];

describe('capitalizeFirstLetter', () => {
    testCases.forEach(({ description, input, expectedOutput }) =>
        describe(description, () => {
            it('should return the expected output', () => {
                const result = capitalizeFirstLetter(input);

                expect(result).toEqual(expectedOutput);
            });
        })
    );
});
