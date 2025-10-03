import {
    compileAqlFilterStatement,
    CoscradBooleanOperator,
    CoscradLogicalOperator,
    CoscradUserQuery,
} from './coscrad-user-query';

/**
 * Note that this is only for prototyping purposes
 */
describe(`CoscradUserQuery`, () => {
    describe(`name includes`, () => {
        const nameIncludes: CoscradUserQuery = {
            operator: CoscradBooleanOperator.OR,
            conditions: [
                {
                    operator: CoscradLogicalOperator.MULTILINGUAL_TEXT_INCLUDES,
                    field: 'name',
                    queryParams: ['OSCRAD'],
                },
            ],
        };
        it(`should return the expected result`, () => {
            const result = compileAqlFilterStatement(nameIncludes);

            expect(result).toBe('name includes');
        });
    });

    describe(`items greater than 10`, () => {
        const itemsGreaterThan10: CoscradUserQuery = {
            operator: CoscradBooleanOperator.OR,
            conditions: [
                {
                    operator: CoscradLogicalOperator.GREATER_THAN,
                    field: 'items',
                    queryParams: [10],
                },
            ],
        };

        it(`should return the expected result`, () => {
            const result = compileAqlFilterStatement(itemsGreaterThan10);

            expect(result).toBe('items greater than 10');
        });
    });

    describe(`or`, () => {
        const nameIncludesAnditemsGreaterThan10: CoscradUserQuery = {
            operator: CoscradBooleanOperator.OR,
            conditions: [
                {
                    operator: CoscradLogicalOperator.GREATER_THAN,
                    field: 'items',
                    queryParams: [10],
                },
                {
                    operator: CoscradLogicalOperator.MULTILINGUAL_TEXT_INCLUDES,
                    field: 'name',
                    queryParams: ['OSCRAD'],
                },
            ],
        };

        it(`should work`, () => {
            const result = compileAqlFilterStatement(nameIncludesAnditemsGreaterThan10);

            expect(result).toBe('or query result');
        });
    });
});
