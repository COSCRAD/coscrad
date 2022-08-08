import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { Category } from '../../domain/models/categories/entities/category.entity';
import { InternalError } from '../../lib/errors/InternalError';
import { NotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../database/database.provider';
import { DatabaseDTO } from '../database/utilities/mapEntityDTOToDatabaseDTO';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository provider > getCategoryRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    const { category: categoryTree } = testData;

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, databaseProvider, testRepositoryProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup;
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('fetchTree', () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.addCategories(categoryTree);

            const result = await testRepositoryProvider.getCategoryRepository().fetchTree();

            expect(cloneToPlainObject(result)).toEqual(cloneToPlainObject(categoryTree));
        });

        // TODO [test-coverage] Test that invalid documents lead to InternalErrors in result
    });

    describe('fetchById', () => {
        describe('when there is a valid document with the given ID', () => {
            it('should return the expected result', async () => {
                await testRepositoryProvider.addCategories(categoryTree);

                const categoryToFetch = categoryTree[0];

                // Add categories and category edges

                const result = await testRepositoryProvider
                    .getCategoryRepository()
                    .fetchById(categoryToFetch.id);

                expect(result).toBeInstanceOf(Category);

                expect((result as Category).toDTO()).toEqual(categoryToFetch.toDTO());
            });
        });

        describe('when there is no document with the given ID', () => {
            it('should return NotFound', async () => {
                // Add categories and category edges

                const result = await testRepositoryProvider
                    .getCategoryRepository()
                    .fetchById('BOGUS-CATEGORY-ID');

                expect(result).toBe(NotFound);
            });
        });

        describe('when there is a document with the given ID that fails invariant validation', () => {
            it('should return an Internal Error', async () => {
                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.categories)
                    .create({ _key: 'BAD-CAT', members: ['foo'] } as DatabaseDTO);

                const result = await testRepositoryProvider
                    .getCategoryRepository()
                    .fetchById('BAD-CAT');

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });

    describe('count', () => {
        it('should return the correct count', async () => {
            const expectedCount = categoryTree.length;

            await testRepositoryProvider.addCategories(categoryTree);

            const result = await testRepositoryProvider.getCategoryRepository().count();

            expect(result).toBe(expectedCount);
        });
    });
});
