import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';

describe(`Tag Queries`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testTagData = buildTestData().tag;

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
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

            it.todo('should not return actions to non-admin users');
        });
    });

    describe(`when fetching all tags`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.testSetup();
        });

        afterEach(async () => {
            await testRepositoryProvider.testTeardown();
        });

        it('should return the expected result', async () => {
            await testRepositoryProvider.getTagRepository().createMany(testTagData);

            const res = await request(app.getHttpServer()).get(`/tags`);

            expect(res.status).toBe(httpStatusCodes.ok);

            expect(res.body).toMatchSnapshot();
        });

        it.todo('should not return actions to non-admin users');
    });
});
