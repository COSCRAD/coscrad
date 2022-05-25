import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setupIntegrationTest from './setupIntegrationTest';

describe(`Tag Queries`, () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testTagData = buildTestData().tags;

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, testRepositoryProvider } = await setupIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    describe(`when fetching a tag by ID`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.testSetup();
        });

        afterEach(async () => {
            await testRepositoryProvider.testTeardown();
        });
        describe('When there is no tag with the given ID', () => {
            it('should return not found', async () => {
                await testRepositoryProvider.getTagRepository().createMany(testTagData);

                const bogusId = 'TOTALLY-BOGUS-TAG-ID';

                return await request(app.getHttpServer())
                    .get(`/tags/${bogusId}`)
                    .expect(httpStatusCodes.notFound);
            });
        });

        describe('when there is a tag with the given ID', () => {
            it('should return the expected result', async () => {
                await testRepositoryProvider.getTagRepository().createMany(testTagData);

                const idToFind = testTagData[0].id;

                const result = await request(app.getHttpServer()).get(`/tags/${idToFind}`);

                expect(result.status).toBe(httpStatusCodes.ok);

                expect(result.body.id).toBe(idToFind);

                expect(result.body).toMatchSnapshot();
            });
        });
    });

    describe(`when fetching all tags`, () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.getTagRepository().createMany(testTagData);

            const res = await request(app.getHttpServer()).get(`/tags`);

            expect(res.status).toBe(httpStatusCodes.ok);

            expect(res.body).toMatchSnapshot();
        });
    });
});
