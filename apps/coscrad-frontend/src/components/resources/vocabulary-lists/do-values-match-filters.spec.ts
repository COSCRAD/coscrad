import doValuesMatchFilters from './do-values-match-filters';

describe('doValuesMatchFilters', () => {
    const valuesToFilter = {
        person: '31',
        aspect: '3',
        positive: false,
    };
    describe('when there is a match', () => {
        const filters = {
            person: '31',
            aspect: '3',
            positive: false,
        };

        it('should return true', () => {
            const result = doValuesMatchFilters(valuesToFilter, filters);

            expect(result).toBe(true);
        });
    });

    describe('when there is a match, disregarding extra props on the input values', () => {
        const valuesToFilterWithExtraProps = {
            ...valuesToFilter,
            foo: 'hello',
            bar: false,
            baz: true,
        };

        const filters = {
            person: '31',
            aspect: '3',
            positive: false,
        };

        it('should return true', () => {
            const result = doValuesMatchFilters(valuesToFilterWithExtraProps, filters);

            expect(result).toBe(true);
        });
    });

    describe('when there is no match', () => {
        const filters = {
            person: '12',
            aspect: '3',
            positive: false,
        };

        it('should return false', () => {
            const result = doValuesMatchFilters(valuesToFilter, filters);

            expect(result).toBe(false);
        });
    });
});
