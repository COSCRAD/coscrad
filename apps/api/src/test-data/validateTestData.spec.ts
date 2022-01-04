import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import { Valid } from '../domain/domainModelValidators/Valid';
import { EntityType, isEntityType } from '../domain/types/entityType';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import { getArangoCollectionID } from '../persistence/database/get-arango-collection-ids';
import mapEntityDTOToDatabaseDTO from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import buildTestData from './buildTestData';
describe('buildTestData', () => {
  describe('the resulting test data', () => {
    const testData = buildTestData();

    Object.entries(testData).forEach(([key, models]) => {
      describe(`Entity type key`, () => {
        it(`Should be a valid entity type`, () => {
          expect(isEntityType(key)).toBeTruthy();
        });

        const entityType = key as EntityType;
        it(`should have a corresponding collection name`, () => {
          const collectionName = getArangoCollectionID(entityType);
        });

        describe(`the DTOs`, () => {
          it(`should have no duplicate IDs`, () => {
            // It's not required to have an ID in the DTO- ID can be auto-assigned by DB
            const allIds = models
              .map((model) => model.id)
              .filter((id) => !isNullOrUndefined(id));

            const numberOfIds = allIds.length;

            const numberOfUniqueIds = [...new Set(allIds)].length;

            expect(numberOfUniqueIds).toEqual(numberOfIds);
          });

          const entityValidator = getValidatorForEntity(entityType);

          models.forEach((dto, index) => {
            describe(`${entityType}(dto # ${index + 1})`, () => {
              it(`should satisfy invariant validation`, () => {
                expect(entityValidator(dto)).toBe(Valid);
              });
            });
          });
        });

        const testDataInDatabaseFormat =
          // Use `collectionNames` not `entityTypes` as keys
          Object.entries(testData).reduce(
            (acc, [key, models]) => ({
              ...acc,
              [getArangoCollectionID(key as EntityType)]: models.map((model) =>
                mapEntityDTOToDatabaseDTO(model)
              ),
            }),
            {}
          );

        writeFileSync(
          'testData.json',
          JSON.stringify(testDataInDatabaseFormat)
        );
      });
    });
  });
});
