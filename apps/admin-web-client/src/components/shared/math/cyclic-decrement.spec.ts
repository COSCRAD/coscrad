import { cyclicDecrement } from './cyclic-decrement';

type TestCase = {
    description: string;
    startingIndex: number;
    numberOfItems: number;
    expectedOutput: number;
};

const numberOfItems = 20;

const testCases: TestCase[] = [
    {
        description: 'when given the starting index (0)',
        startingIndex: 0,
        numberOfItems,
        // max index
        expectedOutput: numberOfItems - 1,
    },
    {
        description: 'when given an interior index (11)',
        startingIndex: 11,
        numberOfItems,
        expectedOutput: 10,
    },
    {
        description: 'when given (1)',
        startingIndex: 1,
        numberOfItems,
        expectedOutput: 0,
    },
    {
        description: `when given the max index (${numberOfItems - 1})`,
        startingIndex: numberOfItems - 1,
        numberOfItems,
        expectedOutput: numberOfItems - 2,
    },
];

describe('cyclicDecrement', () => {
    testCases.forEach(({ description, startingIndex, numberOfItems, expectedOutput }) => {
        describe(description, () => {
            it('should return the expected output', () => {
                const result = cyclicDecrement(startingIndex, numberOfItems);

                expect(result).toBe(expectedOutput);
            });
        });
    });
});
