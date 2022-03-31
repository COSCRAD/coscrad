import { INestApplication } from '@nestjs/common';
import { Entity } from 'apps/api/src/domain/models/entity';
import { EntityType, entityTypes, InMemorySnapshot } from 'apps/api/src/domain/types/entityTypes';
import { InternalError, isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForEntityType from '../utilities/buildViewModelPathForEntityType';
import createTestModule from './createTestModule';

describe('When fetching multiple entities (All entities published)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testData = buildTestData();

    const testDataWithAllEntitiesPublished = Object.entries(testData).reduce(
        (accumulatedData: InMemorySnapshot, [entityType, instances]) => ({
            ...accumulatedData,
            [entityType]: instances.map((instance) =>
                instance.clone({
                    published: true,
                })
            ),
        }),
        {}
    );

    beforeAll(async () => {
        jest.resetModules();

        const moduleRef = await createTestModule(testDatabaseName);

        arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new DatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        app = moduleRef.createNestApplication();

        await app.init();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    // These entities are always published
    const entityTypesToExclude: EntityType[] = [entityTypes.tag];

    Object.values(entityTypes)
        .filter((entityType) => !entityTypesToExclude.includes(entityType))
        .forEach((entityType) => {
            const endpointUnderTest = `/${buildViewModelPathForEntityType(entityType)}`;

            describe(`GET ${endpointUnderTest}`, () => {
                describe('when all of the entities are published', () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(
                            testDataWithAllEntitiesPublished
                        );
                    });

                    it(`should fetch multiple entities of type ${entityType}`, async () => {
                        const res = await request(app.getHttpServer())
                            .get(`/entities${endpointUnderTest}`)
                            .query({
                                type: entityType,
                            });

                        expect(res.status).toBe(httpStatusCodes.ok);

                        expect(res.body.length).toBe(
                            testDataWithAllEntitiesPublished[entityType].length
                        );

                        expect(res.body).toMatchSnapshot();
                    });
                });

                describe(`when some of the entities are unpublished`, () => {
                    /**
                     * Note that there is no requirement that the test data have
                     * `published = true`
                     */
                    const publishedEntitiesToAdd = testData[entityType]
                        .map((instance: Entity) =>
                            instance.clone({
                                published: true,
                            })
                        )
                        .filter((newInstance): newInstance is Entity => {
                            if (isInternalError(newInstance)) {
                                throw new InternalError(
                                    newInstance.innerErrors.reduce(
                                        (accumulatedMessage: string, { message }) =>
                                            accumulatedMessage + ` ${message}`,
                                        ''
                                    )
                                );
                            }

                            return !isInternalError(newInstance);
                        });

                    const unpublishedEntitiesToAdd = testData[entityType]
                        .map((instance, index) =>
                            instance.clone({
                                id: `UNPUBLISHED-00${index + 1}`,
                                published: false,
                            })
                        )
                        // This shouldn't be needed, but typeCheck provides a logical guarantee
                        .filter((newInstance): newInstance is Entity => {
                            if (isInternalError(newInstance)) {
                                throw new InternalError(
                                    newInstance.innerErrors.reduce(
                                        (accumulatedMessage: string, { message }) =>
                                            accumulatedMessage + ` ${message}`,
                                        ''
                                    )
                                );
                            }

                            return !isInternalError(newInstance);
                        })
                        // We want a different number of published \ unpublished terms
                        .slice(0, -1);

                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfSingleType(entityType, [
                            ...unpublishedEntitiesToAdd,
                            ...publishedEntitiesToAdd,
                        ]);
                    });

                    it('should return the expected number of results', async () => {
                        const res = await request(app.getHttpServer()).get(
                            `/entities${endpointUnderTest}`
                        );

                        expect(res.body.length).toBe(publishedEntitiesToAdd.length);

                        // Sanity check
                        expect(publishedEntitiesToAdd.length).not.toEqual(
                            unpublishedEntitiesToAdd.length
                        );

                        expect(res.body).toMatchSnapshot();
                    });
                });
            });

            afterEach(async () => {
                await testRepositoryProvider.testTeardown();
            });
        });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });
});
