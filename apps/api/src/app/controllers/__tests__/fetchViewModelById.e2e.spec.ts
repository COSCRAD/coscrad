import { INestApplication } from '@nestjs/common';
import { Entity } from 'apps/api/src/domain/models/entity';
import { EntityType, entityTypes, InMemorySnapshot } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForEntityType from '../utilities/buildViewModelPathForEntityType';
import createTestModule from './createTestModule';

describe('GET /entities (fetch view models)', () => {
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

            const buildFullPathFromId = (id: string): string => `${endpointUnderTest}/${id}`;

            describe(`When querying for a single View Model by ID`, () => {
                describe(`GET ${endpointUnderTest}/:id`, () => {
                    describe('when the entity is published', () => {
                        describe('when no entity with the id exists', () => {
                            beforeEach(async () => {
                                await testRepositoryProvider.addEntitiesOfManyTypes(
                                    testDataWithAllEntitiesPublished
                                );
                            });

                            it(`should return not found`, () => {
                                return request(app.getHttpServer())
                                    .get(`/entities${buildFullPathFromId('bogus-id')}`)
                                    .expect(httpStatusCodes.notFound);
                            });
                        });

                        describe('when an entity with the id is found', () => {
                            beforeEach(async () => {
                                await testRepositoryProvider.addEntitiesOfManyTypes(
                                    testDataWithAllEntitiesPublished
                                );
                            });

                            it('should return the expected response', async () => {
                                const entityToFind =
                                    testDataWithAllEntitiesPublished[entityType][0];

                                const res = await request(app.getHttpServer()).get(
                                    `/entities${buildFullPathFromId(entityToFind.id)}`
                                );

                                expect(res.status).toBe(httpStatusCodes.ok);

                                expect(res.body.id).toBe(entityToFind.id);

                                expect(res.body).toMatchSnapshot();
                            });
                        });
                    });

                    describe('when an entity with the id is unpublished', () => {
                        const unpublishedId = 'unpublished-01';

                        beforeEach(async () => {
                            await testRepositoryProvider.addEntitiesOfManyTypes(testData);

                            const unpublishedInstance = testData[entityType][0].clone({
                                published: false,
                                id: unpublishedId,
                            });

                            await testRepositoryProvider.addEntitiesOfSingleType(entityType, [
                                unpublishedInstance,
                            ]);
                        });

                        it('should return not found', async () => {
                            const publishedAndUnpublishedInstancesFromRepo =
                                await testRepositoryProvider
                                    .forEntity(entityType)
                                    .fetchMany()
                                    .then((result) =>
                                        result.filter(
                                            (singleInstance): singleInstance is Entity =>
                                                !isInternalError(singleInstance)
                                        )
                                    );

                            /**
                             * Given 404 is not a very specific symptom, let's be sure the
                             * unpubished entity was in the db to start with
                             */
                            const isUnpublishedEntityIdInDB =
                                publishedAndUnpublishedInstancesFromRepo.some(
                                    ({ id }) => id === unpublishedId
                                );

                            expect(isUnpublishedEntityIdInDB).toBe(true);

                            return request(app.getHttpServer())
                                .get(`/entities${buildFullPathFromId(unpublishedId)}`)
                                .expect(httpStatusCodes.notFound);
                        });
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
