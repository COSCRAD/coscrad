import { isUUID } from '@coscrad/validation';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { InternalError } from '../../../lib/errors/InternalError';
import { NotAvailable } from '../../../lib/types/not-available';
import { NotFound } from '../../../lib/types/not-found';
import { OK } from '../../../lib/types/ok';
import { ArangoCollectionId } from '../../../persistence/database/collection-references/ArangoCollectionId';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When generating a new ID (POST /ids)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    // let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let idManager: IIdManager;

    beforeAll(async () => {
        ({ app, databaseProvider, testRepositoryProvider, idManager } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
        }));
    });

    afterAll(async () => {
        // await arangoConnectionProvider.dropDatabaseIfExists();
    });

    describe(`before generating any IDs`, () => {
        describe('the id collection', () => {
            it('should have no documents', async () => {
                const numberOfIdDocsToStart = await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.uuid)
                    .getCount();

                expect(numberOfIdDocsToStart).toBe(0);
            });
        });
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

    describe('when reserving an existing ID', () => {
        it('should update the resreved status of the ID appropriately in the database', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const id = res.text;

            await idManager.use(id);

            const updatedIdDoc = await testRepositoryProvider.getIdRepository().fetchById(id);

            expect(updatedIdDoc).toEqual({
                id,
                isAvailable: false,
            });
        });
    });

    describe('an attempt to reserve an ID that is already in use', () => {
        it('should fail', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const id = res.text;

            // use the ID for the first time
            await idManager.use(id);

            expect.assertions(1);

            try {
                await idManager.use(id);
            } catch (error) {
                expect(error).toBeInstanceOf(InternalError);
            }
        });
    });

    describe('when checking the status of an ID', () => {
        describe('when the ID has never been registered', () => {
            it('should return NotFound', async () => {
                const result = await idManager.status('bogus-id');

                expect(result).toBe(NotFound);
            });
        });

        describe('when the ID is already in use', () => {
            it('should return NotAvailable', async () => {
                const res = await request(app.getHttpServer()).post(`/ids`);

                const id = res.text;

                await idManager.use(id);

                const result = await idManager.status(id);

                expect(result).toBe(NotAvailable);
            });
        });

        describe('when the ID is available for use', () => {
            it('should return OK', async () => {
                const res = await request(app.getHttpServer()).post(`/ids`);

                const id = res.text;

                const result = await idManager.status(id);

                expect(result).toBe(OK);
            });
        });
    });
});
