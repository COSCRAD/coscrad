import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import createTestModule from './createTestModule';

describe('When fetching the category tree (/treeOfKnowledge)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testData = buildTestData().categoryTree;

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
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`GET /treeOfKnowledge`, () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.addCategories(testData);

            const res = await request(app.getHttpServer()).get('/treeOfKnowledge');

            expect(res.status).toBe(httpStatusCodes.ok);

            expect(res.body).toMatchSnapshot();
        });
    });
});
