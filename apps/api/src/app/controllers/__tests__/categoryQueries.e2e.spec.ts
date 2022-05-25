import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setupIntegrationTest from './setupIntegrationTest';

describe('When fetching the category tree (/treeOfKnowledge)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testData = buildTestData().categoryTree;

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, testRepositoryProvider } = await setupIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
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
