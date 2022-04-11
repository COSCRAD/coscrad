import { INestApplication } from '@nestjs/common';
import { Resource } from 'apps/api/src/domain/models/resource.entity';
import {
    InMemorySnapshot,
    ResourceType,
    resourceTypes,
} from 'apps/api/src/domain/types/resourceTypes';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import createTestModule from './createTestModule';

describe('When fetching multiple entities', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testData = buildTestData();

    const testDataWithAllEntitiesPublished = Object.entries(testData).reduce(
        (accumulatedData: InMemorySnapshot, [ResourceType, instances]) => ({
            ...accumulatedData,
            [ResourceType]: instances.map((instance) =>
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

    // These entities are always published
    const resourceTypesToExclude: ResourceType[] = [resourceTypes.tag];

    Object.values(resourceTypes)
        .filter((ResourceType) => !resourceTypesToExclude.includes(ResourceType))
        .forEach((ResourceType) => {
            const endpointUnderTest = `/${buildViewModelPathForResourceType(ResourceType)}`;

            describe(`GET ${endpointUnderTest}`, () => {
                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();
                });

                afterEach(async () => {
                    await testRepositoryProvider.testTeardown();
                });

                describe('when all of the entities are published', () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(
                            testDataWithAllEntitiesPublished
                        );
                    });

                    it(`should fetch multiple entities of type ${ResourceType}`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            `/entities${endpointUnderTest}`
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        expect(res.body.length).toBe(
                            testDataWithAllEntitiesPublished[ResourceType].length
                        );

                        expect(res.body).toMatchSnapshot();
                    });
                });

                describe(`when some of the entities are unpublished`, () => {
                    /**
                     * Note that there is no requirement that the test data have
                     * `published = true`
                     */
                    const publishedEntitiesToAdd = testData[ResourceType].map(
                        (instance: Resource) =>
                            instance.clone({
                                published: true,
                            })
                    );

                    const unpublishedEntitiesToAdd = testData[ResourceType]
                        // We want a different number of published \ unpublished terms
                        .slice(0, -1)
                        .map((instance, index) =>
                            instance.clone({
                                id: `UNPUBLISHED-00${index + 1}`,
                                published: false,
                            })
                        );

                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfSingleType(ResourceType, [
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
        });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });
});
