import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getInstanceFactoryForResource from '../../domain/factories/getInstanceFactoryForResource';
import { Resource } from '../../domain/models/resource.entity';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import buildTestData from '../../test-data/buildTestData';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';

/**
 * Note that historically we persisted state at the level of snapshots. This
 * test gave us a quick sanity check that every resource repository was working.
 *
 * We are moving towards properly event sourcing our domain by storing only
 * events in the command database. This leads to a change in the implementation
 * of our repositories. Going forward, we have decided to have a single smoke-test \
 * sanity check for each aggregate root (including resource) repository.
 *
 * Eventually, all existing resources will become event sourced in this way.
 * In the meantime, we skip this test as our command integration tests give us
 * very good coverage of the repositories anyway.
 */
describe.skip('Repository provider > repositoryForEntity', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    const testData = buildTestData().resources;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    beforeAll(async () => {
        ({ app, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await app.close();
    });

    const eventSourcedResourceTypes = [ResourceType.song];

    Object.values(ResourceType)

        // TODO [https://www.pivotaltracker.com/story/show/185903292] We need a separate test for event-sourced repositories
        .filter((rt) => !eventSourcedResourceTypes.includes(rt))
        .forEach((resourceType) => {
            describe(`Repository for entity of type ${resourceType}`, () => {
                beforeEach(async () => {
                    await testRepositoryProvider.addResourcesOfManyTypes(testData);
                });

                afterEach(async () => {
                    await testRepositoryProvider.testTeardown();
                });
                describe('fetchMany', () => {
                    describe('When no specification is provided', () => {
                        it('should return the expected result', async () => {
                            const result = await testRepositoryProvider
                                .forResource(resourceType)
                                .fetchMany();

                            /**
                             * TODO [https://www.pivotaltracker.com/story/show/181503421] setup a
                             * custom matcher in Jest for comparing instances (not DTOs)
                             * */
                            expect(JSON.stringify(result)).toEqual(
                                JSON.stringify(testData[resourceType])
                            );
                        });
                    });
                });

                describe('fetchById', () => {
                    describe('when there is an entity with the given id', () => {
                        it('should return the expected result', async () => {
                            const entityToFind = testData[resourceType][0];

                            const result = await testRepositoryProvider
                                .forResource(resourceType)
                                .fetchById(entityToFind.id);

                            // TODO custom matcher (Same as above)
                            expect(JSON.stringify(result)).toEqual(JSON.stringify(entityToFind));
                        });
                    });

                    describe('when there is no entity with the given id', () => {
                        it('should return not found', async () => {
                            const result = await testRepositoryProvider
                                .forResource(resourceType)
                                .fetchById('BOGUS-ENTITY-ID');

                            // TODO custom matcher (Same as above)
                            expect(result).toEqual(NotFound);
                        });
                    });
                });

                //
                describe('getCount', () => {
                    it('should return the expected count', async () => {
                        const expectedCount = testData[resourceType].length;

                        const actualCount = await testRepositoryProvider
                            .forResource(resourceType)
                            .getCount();

                        expect(actualCount).toEqual(expectedCount);
                    });
                });

                describe('create', () => {
                    it('should successfully create the new entity', async () => {
                        const dtoForEntityToCreate = {
                            ...testData[resourceType][0].toDTO(),
                            id: 'BRAND-NEW-ENTITY-ID',
                        };

                        const entityFactory = getInstanceFactoryForResource(resourceType);

                        const newEntityInstance = entityFactory(dtoForEntityToCreate);

                        /**
                         * This is just to satisfy the typeScript compiler. It shouldn't happen,
                         * as we already pass our test data through the validators as part of
                         * a separate test.
                         */
                        if (isInternalError(newEntityInstance)) throw newEntityInstance;

                        await testRepositoryProvider
                            .forResource(resourceType)
                            .create(newEntityInstance);

                        const entityFetchedAfterCreation = await testRepositoryProvider
                            .forResource(resourceType)
                            .fetchById(newEntityInstance.id);

                        expect(entityFetchedAfterCreation).not.toBe(NotFound);

                        expect(JSON.stringify(entityFetchedAfterCreation)).toEqual(
                            JSON.stringify(newEntityInstance)
                        );
                    });
                });

                describe('createMany', () => {
                    it('should successfully create all new entities', async () => {
                        const entityFactory = getInstanceFactoryForResource(resourceType);

                        const newEntitiesToCreateOrErrors = testData[resourceType]
                            .map((oldEntity, index) => ({
                                ...oldEntity.toDTO(),
                                id: `NEW-ENTITY-ID-${index + 1}`,
                            }))
                            .map((dto) => entityFactory(dto));

                        /**
                         * **note** This shouldn't happen as we already test that our test
                         * data satisfies invariant validation and we are only changing the
                         * id here (so to avoid collisions in the db).
                         */
                        if (newEntitiesToCreateOrErrors.some(isInternalError))
                            throw new InternalError(
                                [
                                    `Encountered invalid test data for entity of type: ${resourceType}.`,
                                    `\n You may want to run validateTestData.spec.ts`,
                                ].join(' ')
                            );

                        /**
                         * This is solely to quiet typeCheck without casting, as we've
                         * already thrown if any validation errors were returned from the
                         * factory.
                         */
                        const newEntitiesToCreate = newEntitiesToCreateOrErrors.filter(
                            (entityOrError): entityOrError is Resource =>
                                !isInternalError(entityOrError)
                        );

                        await testRepositoryProvider
                            .forResource(resourceType)
                            .createMany(newEntitiesToCreate);

                        newEntitiesToCreate.forEach(async (entity) => {
                            const entityFetchedAfterCreation = await testRepositoryProvider
                                .forResource(resourceType)
                                .fetchById(entity.id);

                            expect(entityFetchedAfterCreation).not.toBe(NotFound);

                            expect(JSON.stringify(entityFetchedAfterCreation)).toEqual(
                                JSON.stringify(entity)
                            );
                        });
                    });
                });
            });
        });
});
