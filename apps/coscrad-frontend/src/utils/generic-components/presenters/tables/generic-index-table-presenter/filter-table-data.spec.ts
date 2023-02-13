import { filterTableData, Matchers } from './filter-table-data';

type TestCase<T = unknown> = {
    description: string;
    tableData: T[];
    selectedFilterableProperties: (keyof T)[];
    searchTerm: string;
    matchers: Matchers<T>;
    expectedResult: T[];
};

const rowThatMatchesHello = {
    foo: 5,
    bar: 'hello world',
    baz: { a: 1, b: 2 },
};

const rowThatDoesNotMatchHello = {
    foo: 99,
    bar: 'goodbye universe',
    baz: { a: 12, b: 32 },
};

const rowWithBigBaz = {
    foo: 99,
    bar: 'goodbye universe',
    baz: { a: 120, b: 32 },
};

const comprehensiveMatchers = {
    foo: (value: number, searchTerm: string) => parseInt(searchTerm) === value,
    bar: (value: string, searchTerm: string) => value.includes(searchTerm),
    baz: ({ a, b }, searchTerm: string) =>
        String(a).includes(searchTerm) || String(b).includes(searchTerm),
};

type Widget = {
    foo: number;
    bar: string;
    baz: { a: number; b: number };
};

const allMatchersTestCase: TestCase<Widget> = {
    description: 'when all matchers are provided',
    tableData: [rowThatMatchesHello, rowThatDoesNotMatchHello],
    selectedFilterableProperties: ['foo', 'bar', 'baz'],
    searchTerm: 'hello', // find this in hello world
    matchers: comprehensiveMatchers,
    expectedResult: [rowThatMatchesHello],
};

/**
 * This case is unnecessary if we tighten up our type safety to only specify
 * matchers for `selectedFilterableProperties`
 */
const excludedPropertyTestCase: TestCase<Widget> = {
    description: 'when a matcher is provided but the property is not filterable',
    tableData: [rowThatMatchesHello, rowThatDoesNotMatchHello],
    selectedFilterableProperties: ['foo', 'baz'],
    searchTerm: 'hello', // technically matches in `bar` but `bar` is not a filterable property
    matchers: comprehensiveMatchers,
    expectedResult: [],
};

const defaultMatcherTestCase: TestCase<Widget> = {
    description: 'when a matcher is not provided for a filterable property (match via default)',
    tableData: [rowThatMatchesHello, rowThatDoesNotMatchHello],
    selectedFilterableProperties: ['foo', 'bar', 'baz'],
    searchTerm: 'HEllo', // the default should be a case-insensitive search
    matchers: {
        foo: comprehensiveMatchers['foo'],
        baz: comprehensiveMatchers['baz'],
    },
    expectedResult: [rowThatMatchesHello],
};

const defaultMatcherWithNoMatchTestCase: TestCase<Widget> = {
    description: 'when a matcher is not provided for a filterable property (match via default)',
    tableData: [
        {
            ...rowThatMatchesHello,
            bar: 'I do not match you here or there!',
        },
        rowThatDoesNotMatchHello,
    ],
    selectedFilterableProperties: ['foo', 'bar', 'baz'],
    searchTerm: 'HEllo', // the default should be a case-insensitive search
    matchers: {
        foo: comprehensiveMatchers['foo'],
        baz: comprehensiveMatchers['baz'],
    },
    expectedResult: [],
};

const numericMatcherTestCase: TestCase<Widget> = {
    description: 'when all matchers are provided',
    tableData: [rowThatMatchesHello, rowThatDoesNotMatchHello, rowWithBigBaz],
    selectedFilterableProperties: ['foo', 'bar', 'baz'],
    searchTerm: '50', // find this in hello world
    matchers: {
        ...comprehensiveMatchers,
        baz: ({ a }, searchTerm: string) => parseInt(searchTerm) < a,
    },
    expectedResult: [rowWithBigBaz],
};

/* eslint-disable-next-line */
const testCases: TestCase<any>[] = [
    allMatchersTestCase,
    excludedPropertyTestCase,
    defaultMatcherTestCase,
    defaultMatcherWithNoMatchTestCase,
    numericMatcherTestCase,
];

describe(`filterTableData`, () => {
    testCases.forEach(
        ({
            description,
            tableData,
            selectedFilterableProperties,
            searchTerm,
            matchers,
            expectedResult,
        }) => {
            describe(description, () => {
                it(`should return the expected result`, () => {
                    // Arrange => build test case

                    // Act
                    const result = filterTableData(
                        tableData,
                        selectedFilterableProperties,
                        searchTerm,
                        matchers
                    );

                    // Assert
                    expect(result).toEqual(expectedResult);
                });
            });
        }
    );
});
