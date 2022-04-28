import { INestApplication } from '@nestjs/common';
import createTestModule from '../../app/controllers/__tests__/createTestModule';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { DatabaseProvider } from '../database/database.provider';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository provider > getEdgeConnectionRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

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

    afterAll(async () => {
        // await testRepositoryProvider.testTeardown();

        await app.close();
    });

    const { connections, resources } = testData;

    connections
        .filter((_, index) => index === 0)
        .forEach((connection) =>
            describe(`connection with id: ${connection.id}`, () => {
                beforeEach(async () => {
                    // await testRepositoryProvider.testSetup();

                    await testRepositoryProvider.addEntitiesOfManyTypes(resources);

                    await testRepositoryProvider
                        .getEdgeConnectionRepository()
                        .createMany(connections);
                });

                // afterEach(async () => {
                //     await testRepositoryProvider.testTeardown();
                // });

                describe('fetchById', () => {
                    describe(`when there is an edge connection with the given id: ${connection.id}`, () => {
                        it('should return the entity', async () => {
                            const expectedResult = connections.find(
                                ({ id: testInstanceId }) => testInstanceId === connection.id
                            );

                            const actualResult = await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .fetchById(connection.id);

                            // In case expectedResult didn't find anything with the search
                            expect(actualResult).toBeTruthy();

                            expect(actualResult).toEqual(expectedResult);
                        });
                    });
                });
            })
        );

    /**
     * There's only one edge connection.
     *
     * - add every edge connection in the test data
     * - for each edge connection in the test data, fetchById should return it back
     * - fetchMany should return all of the edge connections
     * - count should return the appropriate result
     */
});
