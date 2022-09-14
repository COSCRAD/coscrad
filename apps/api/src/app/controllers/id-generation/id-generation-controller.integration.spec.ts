import { isUUID } from '@coscrad/validation';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

describe('POST /ids', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        ({ app, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads',
        }));
    });

    afterAll(async () => {
        await app.close();
    });

    describe(`when generating a new ID`, () => {
        it('should generate a UUID with the correct format', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const doesNewIdHaveUuidFormat = isUUID(res.text);

            expect(doesNewIdHaveUuidFormat).toBe(true);
        });

        it('should correctly persist the ID in the database', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const persistedId = await testRepositoryProvider.getIdRepository().fetchById(res.text);

            expect(persistedId).toEqual({
                id: res.text,
                isAvailable: true,
            });
        });
    });
});
