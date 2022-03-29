import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import getInstanceFactoryForEntity from 'apps/api/src/domain/factories/getInstanceFactoryForEntity';
import { EntityType, entityTypes, InMemorySnapshot } from 'apps/api/src/domain/types/entityType';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import { RepositoryProvider } from 'apps/api/src/persistence/repositories/repository.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService.spec';
import httpStatusCodes from '../../constants/httpStatusCodes';
import { EntityViewModelController } from '../entityViewModel.controller';

export const createTestModule = async (testDatabaseName: string) =>
    Test.createTestingModule({
        providers: [
            {
                provide: ConfigService,
                useFactory: () =>
                    buildMockConfigServiceSpec(
                        {
                            ARANGO_DB_NAME: testDatabaseName,
                        },
                        buildConfigFilePath(Environment.test)
                    ),
            },
            {
                provide: ArangoConnectionProvider,
                useFactory: async (configService: ConfigService) => {
                    const provider = new ArangoConnectionProvider(configService);

                    await provider.initialize();

                    return provider;
                },
                inject: [ConfigService],
            },
            {
                provide: RepositoryProvider,
                useFactory: (arangoConnectionProvider: ArangoConnectionProvider) => {
                    return new RepositoryProvider(new DatabaseProvider(arangoConnectionProvider));
                },
                inject: [ArangoConnectionProvider],
            },
        ],

        controllers: [EntityViewModelController],
    }).compile();

describe.skip('GET /entities (fetch view models)- all entities published', () => {
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
                getInstanceFactoryForEntity(entityType as EntityType)({
                    ...instance.toDTO(),
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

    describe(`when entity type is omitted`, () => {
        it('should return a 400', () => request(app.getHttpServer()).get(`/entities`).expect(400));
    });

    Object.values(entityTypes).forEach((entityType) => {
        describe(`when querying for view models for entity of type ${entityType}`, () => {
            describe('when an id is not provided', () => {
                describe(`?type=${entityType} (fetching many view models) - all entities published`, () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(
                            testDataWithAllEntitiesPublished
                        );
                    });
                    it(`should fetch multiple entities of type ${entityType}`, async () => {
                        const res = await request(app.getHttpServer()).get(`/entities`).query({
                            type: entityType,
                        });

                        expect(res.status).toBe(httpStatusCodes.ok);

                        expect(res.body.length).toBe(
                            testDataWithAllEntitiesPublished[entityType].length
                        );

                        expect(res.body).toMatchSnapshot();
                    });
                });
            });

            describe(`?type=${entityType} when an id is provided`, () => {
                describe('when no entity with the id exists', () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(
                            testDataWithAllEntitiesPublished
                        );
                    });
                    it(`should return not found`, () => {
                        return request(app.getHttpServer())
                            .get(`/entities`)
                            .query({
                                type: entityType,
                                id: 'bogus-id',
                            })
                            .expect(httpStatusCodes.notFound);
                    });
                });

                describe('when an entity with the id is found', () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(
                            testDataWithAllEntitiesPublished
                        );
                    });
                    it('should return a valid response', async () => {
                        const entityToFind = testDataWithAllEntitiesPublished[entityType][0];

                        const res = await request(app.getHttpServer()).get(`/entities`).query({
                            type: entityType,
                            id: entityToFind.id,
                        });

                        expect(res.status).toBe(httpStatusCodes.ok);

                        expect(res.body.id).toBe(entityToFind.id);
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
