import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When fetching the category tree (/treeOfKnowledge)', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    const testData = buildTestData().category;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
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

        /**
         * TODO[https://www.pivotaltracker.com/story/show/184125180]
         *
         * We aren't yet exposing commands through the query endpoint for
         * categories, as its API is different and we haven't created these yet.
         * Once we do so, we should test (as a matter of UX) that we don't
         * return actions to non-admin users, for whom they will certainly fail.
         */
        it.todo('should not return actions for non-admin users');
    });
});
