import { Resource } from '../../../domain/models/resource.entity';
import mapEntityDTOToDatabaseDTO from './mapEntityDTOToDatabaseDTO';

describe('mapEntityDTOToDatabaseDTO', () => {
    const dtoWithValidID = {
        id: '123',
        foo: 'nope',
        baz: 4,
        bar: {
            isActive: false,
            numbers: [1, 2, 3, 4, 5],
        },
    };
    describe('When given a dto with an ID property', () => {
        const actualDatabaseDTO = mapEntityDTOToDatabaseDTO(dtoWithValidID);

        const expectedDatabaseDTO = {
            _key: '123',
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

    describe('When given a dto with an invalid type for the ID property', () => {
        [null, undefined, 7, {}, '', () => 5].forEach((invalidID) => {
            const dtoWithInvalidTypeForID = {
                ...dtoWithValidID,
                id: invalidID,
            };

            const dtoWithoutIDProperty = {
                ...dtoWithInvalidTypeForID,
                id: undefined,
            };

            const actualDatabaseDTO = mapEntityDTOToDatabaseDTO(
                dtoWithInvalidTypeForID as unknown as Resource
            );

            it(`value ${invalidID}: it should omit the id property`, () => {
                expect(actualDatabaseDTO).toEqual(dtoWithoutIDProperty);
            });
        });
    });
});
