import { cyclicIncrement } from './cyclic-increment';

type TestCase = {
    description: string;
    startingIndex: number;
    numberOfItems: number;
    expectedOutput: number;
};

const numberOfItems = 53;

const testCases: TestCase[] = [
    {
        description: 'when given the starting index (0)',
        startingIndex: 0,
        numberOfItems,
        expectedOutput: 1,
    },
    {
        description: 'when given an interior index (20)',
        startingIndex: 20,
        numberOfItems,
        expectedOutput: 21,
    },
    {
        description: 'when one away (51) from the max index (52)',
        startingIndex: 51,
        numberOfItems,
        expectedOutput: 52,
    },
    {
        description: 'when already at the  max index (52)',
        startingIndex: 52,
        numberOfItems,
        expectedOutput: 0,
    },
];

describe('cyclicIncrement', () => {
    testCases.forEach(({ description, startingIndex, numberOfItems, expectedOutput }) => {
        describe(description, () => {
            it('should return the expected output', () => {
                const result = cyclicIncrement(startingIndex, numberOfItems);

                expect(result).toBe(expectedOutput);
            });
        });
    });
});
