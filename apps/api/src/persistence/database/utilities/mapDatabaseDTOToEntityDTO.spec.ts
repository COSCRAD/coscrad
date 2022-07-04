import mapDatabaseDTOToEntityDTO from './mapDatabaseDocumentToAggregateDTO';

/**
 * TODO [test-coverage]: Add sanity check that calls `mapDatabaseDTOToEntityDTO`
 * followed by `mapEntityDTOToDatabaseDTO` and checks that this is an identity
 * mapping.
 */
describe('mapDatabaseDTOToEntityDTO', () => {
    const dtoWithValidKeyForID = {
        _key: '123',
        foo: 'nope',
        baz: 4,
        bar: {
            isActive: false,
            numbers: [1, 2, 3, 4, 5],
        },
    };
    describe('When given a dto with an ID property', () => {
        const actualDatabaseDTO = mapDatabaseDTOToEntityDTO(dtoWithValidKeyForID);

        const expectedDatabaseDTO = {
            id: '123',
            foo: 'nope',
            baz: 4,
            bar: {
                isActive: false,
                numbers: [1, 2, 3, 4, 5],
            },
        };
        it('should map the dto to an appropriate database dto', () => {
            expect(actualDatabaseDTO).toEqual(expectedDatabaseDTO);
        });
    });
});
