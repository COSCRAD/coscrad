import { INestApplication } from '@nestjs/common';
import createTestModule from '../../app/controllers/__tests__/createTestModule';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { DatabaseProvider } from '../database/database.provider';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository provider > getCategoryRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    console.log({
        testDatabaseName,
    });

    const testData = buildTestData();

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    const { categoryTree } = testData;

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

    // afterAll(async () => {
    //     await testRepositoryProvider.testTeardown();

    //     await app.close();
    // });

    describe('fetchTree', () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.addCategories(categoryTree);

            const result = await testRepositoryProvider.getCategoryRepository().fetchTree();

            expect(result).toEqual(categoryTree);
        });
    });

    describe('fetchById', () => {
        it('should return the expected result', async () => {
            const categoryToFetch = categoryTree[0];

            // Add categories and category edges

            const result = await testRepositoryProvider
                .getCategoryRepository()
                .fetchById(categoryToFetch.id);

            expect(result).toEqual(categoryToFetch);
        });
    });

    describe('count', () => {
        it('should return the correct count', async () => {
            const expectedCount = categoryTree.length;

            // TODO Add categories and their edges to db

            const result = await testRepositoryProvider.getCategoryRepository().count();

            expect(result).toBe(expectedCount);
        });
    });
});
