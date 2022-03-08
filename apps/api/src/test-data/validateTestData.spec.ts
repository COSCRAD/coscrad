import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import { Valid } from '../domain/domainModelValidators/Valid';
import {
  EntityType,
  EntityTypeToInstance,
  isEntityType,
} from '../domain/types/entityType';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import isStringWithNonzeroLength from '../lib/utilities/isStringWithNonzeroLength';
import { getArangoCollectionIDFromEntityType } from '../persistence/database/get-arango-collection-ids';
import mapEntityDTOToDatabaseDTO from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { PartialDTO } from '../types/partial-dto';
import buildTestData from './buildTestData';

export type InMemorySnapshotOfDTOs = {
  [K in keyof EntityTypeToInstance]?: PartialDTO<EntityTypeToInstance>[K][];
};

describe('buildTestData', () => {
  describe('the resulting test data', () => {
    const testData = Object.entries(buildTestData()).reduce(
      (
        accumulatedDataWithDtos: InMemorySnapshotOfDTOs,
        [entityType, instances]
      ) => ({
        ...accumulatedDataWithDtos,
        [entityType]: instances.map((instance) => instance.toDTO()),
      }),
      {}
    );

    Object.entries(testData).forEach(([key, models]) => {
      describe(`Entity type key`, () => {
        it(`Should be a valid entity type`, () => {
          expect(isEntityType(key)).toBeTruthy();
        });

        const entityType = key as EntityType;
        it(`should have a corresponding collection name`, () => {
          const collectionName =
            getArangoCollectionIDFromEntityType(entityType);
        });

        describe(`the DTOs`, () => {
          it(`should have no duplicate IDs`, () => {
            const allIds = models
              .map((model) => model.id)
              /**
               * We have a separate check for missing `id` properties
               */
              .filter((id) => !isNullOrUndefined(id));

            const numberOfIds = allIds.length;

            const numberOfUniqueIds = [...new Set(allIds)].length;

            expect(numberOfUniqueIds).toEqual(numberOfIds);
          });

          const entityValidator = getValidatorForEntity(entityType);

          models.forEach((dto, index) => {
            describe(`${entityType}(dto # ${index + 1})`, () => {
              it(`should have an id`, () => {
                expect(isStringWithNonzeroLength(dto.id)).toBe(true);
              });
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
              [getArangoCollectionIDFromEntityType(key as EntityType)]:
                models.map((model) => mapEntityDTOToDatabaseDTO(model)),
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
