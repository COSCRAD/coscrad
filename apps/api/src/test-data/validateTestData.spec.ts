import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import { isValid } from '../domain/domainModelValidators/Valid';
import {
    EntityType,
    entityTypes,
    EntityTypeToInstance,
    isEntityType,
} from '../domain/types/entityTypes';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import isStringWithNonzeroLength from '../lib/utilities/isStringWithNonzeroLength';
import { getArangoCollectionIDFromEntityType } from '../persistence/database/getArangoCollectionIDFromEntityType';
import mapEntityDTOToDatabaseDTO from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { PartialDTO } from '../types/partial-dto';
import buildTestData from './buildTestData';

export type InMemorySnapshotOfDTOs = {
    [K in keyof EntityTypeToInstance]?: PartialDTO<EntityTypeToInstance>[K][];
};

describe('buildTestData', () => {
    describe('the resulting test data', () => {
        const testData = Object.entries(buildTestData()).reduce(
            (accumulatedDataWithDtos: InMemorySnapshotOfDTOs, [entityType, instances]) => ({
                ...accumulatedDataWithDtos,
                [entityType]: instances.map((instance) => instance.toDTO()),
            }),
            {}
        );

        Object.values(entityTypes).forEach((key) => {
            const models = testData[key];
            describe(`Entity of type ${key}`, () => {
                it(`Should be a valid entity type`, () => {
                    expect(isEntityType(key)).toBe(true);
                });

                const entityType = key as EntityType;
                it(`should have a corresponding collection name`, () => {
                    const collectionName = getArangoCollectionIDFromEntityType(entityType);

                    expect(isStringWithNonzeroLength(collectionName)).toBe(true);
                });

                describe(`the DTOs`, () => {
                    /**
                     * TODO Also check that entitiy types that correspond to a
                     * union of models have at least one example of each member
                     * of the union. (See e.g. `Spatial Feature`)
                     */
                    it(`should have at least one test data DTO`, () => {
                        const numberOfTestDataEntries = models.length;

                        expect(numberOfTestDataEntries).toBeGreaterThan(0);
                    });
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
                                const validationResult = entityValidator(dto);

                                expect(isValid(validationResult)).toBe(true);
                            });
                        });
                    });
                });

                const testDataInDatabaseFormat =
                    // Use `collectionNames` not `entityTypes` as keys
                    Object.entries(testData).reduce(
                        (acc, [key, models]) => ({
                            ...acc,
                            [getArangoCollectionIDFromEntityType(key as EntityType)]: models.map(
                                (model) => mapEntityDTOToDatabaseDTO(model)
                            ),
                        }),
                        {}
                    );

                // TODO move this to a config- better yet avoid this whole write!
                const testDataFilePath = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json`;

                const numberOfSpacesToIndent = 4;

                writeFileSync(
                    testDataFilePath,
                    JSON.stringify(testDataInDatabaseFormat, null, numberOfSpacesToIndent)
                );
            });
        });
    });
});
