import buildTestDatabaseSuffixFromFilePath from './buildTestDatabaseSuffixFromFilePath';

type ValidTestCase = {
    description: string;
    input: string;
    expectedResult: string;
};

const validTestCases: ValidTestCase[] = [
    {
        description: `when there are multiple directories in the path`,
        input: `apps/api/src/awesome-test.spec.ts`,
        expectedResult: `awesome-test`,
    },
    {
        description: `when the path is for an e2e test`,
        input: `apps/api/src/database-hitter.e2e.spec.ts`,
        expectedResult: `database-hitter`,
    },
    {
        description: `when the path is for an integration (not marked as e2e) test`,
        input: `mydir/query-tester.integration.spec.ts`,
        expectedResult: `query-tester`,
    },
    {
        description: `when the spec file is named using camel case`,
        input: `__tests__/camelTester.spec.ts`,
        expectedResult: `camelTester`,
    },
];

type InvalidTestCase = {
    description: string;
    input: string;
};

const invalidTestCases: InvalidTestCase[] = [
    {
        description: `when the path is undefined`,
        input: undefined,
    },
    {
        description: `when the path is null`,
        input: null,
    },
    {
        description: 'when the path is an empty string',
        input: '',
    },
];

describe(`buildTestDatabaseNameFromFilePath`, () => {
    describe(`when the input is valid`, () => {
        validTestCases.forEach(({ description, input, expectedResult }) => {
            describe(description, () => {
                it('should return the expected result', () => {
                    const result = buildTestDatabaseSuffixFromFilePath(input);

                    expect(result).toBe(expectedResult);
                });
            });
        });
    });

    invalidTestCases.forEach(({ description, input }) =>
        describe(description, () => {
            it(`should throw`, () => {
                const attempt = () => buildTestDatabaseSuffixFromFilePath(input);

                expect(attempt).toThrow();
            });
        })
    );
});
