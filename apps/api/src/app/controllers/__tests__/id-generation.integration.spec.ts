import { isNonEmptyString, isUUID } from '@coscrad/validation-constraints';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { AggregateType } from '../../../domain/types/AggregateType';
import { InternalError } from '../../../lib/errors/InternalError';
import { IIdRepository } from '../../../lib/id-generation/interfaces/id-repository.interface';
import { UuidDocument } from '../../../lib/id-generation/types/UuidDocument';
import { NotAvailable } from '../../../lib/types/not-available';
import { NotFound } from '../../../lib/types/not-found';
import { OK } from '../../../lib/types/ok';
import { ArangoCollectionId } from '../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { ArangoIdRepository } from '../../../persistence/repositories/arango-id-repository';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When generating a new ID (POST /ids)', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let testIdRepository: IIdRepository;

    let idManager: IIdManager;

    beforeAll(async () => {
        ({ app, databaseProvider, testRepositoryProvider, idManager } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
        }));

        await testRepositoryProvider.testSetup();

        testIdRepository = new ArangoIdRepository(databaseProvider);
    });

    afterAll(async () => {
        await app.close();
    });

    describe(`before generating any IDs`, () => {
        describe('the id collection', () => {
            it('should have no documents', async () => {
                const numberOfIdDocsToStart = await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.uuids)
                    .getCount();

                expect(numberOfIdDocsToStart).toBe(0);
            });
        });
    });

    describe('IdManagementService.generate', () => {
        describe(`when generating a new ID`, () => {
            it('should generate a UUID with the correct format', async () => {
                const newId = await idManager.generate();

                const doesNewIdHaveUuidFormat = isUUID(newId);

                expect(doesNewIdHaveUuidFormat).toBe(true);
            });

            it('should correctly persist the ID in the database', async () => {
                const newId = await idManager.generate();

                const persistedIdDocument = (await testIdRepository.fetchById(
                    newId
                )) as UuidDocument;

                expect(persistedIdDocument.id).toBe(newId);

                expect(persistedIdDocument.usedBy).toBe(undefined);

                expect(isNonEmptyString(persistedIdDocument.timeGenerated)).toBe(true);
            });
        });
    });

    describe('IdManagementService.use', () => {
        describe('when using an existing ID', () => {
            it('should update the resreved status of the ID appropriately in the database', async () => {
                const res = await request(app.getHttpServer()).post(`/ids`);

                const id = res.text;

                const type = AggregateType.user;

                await idManager.use({ id, type });

                const updatedIdDoc = (await testIdRepository.fetchById(id)) as UuidDocument;

                expect(updatedIdDoc.id).toBe(id);

                expect(updatedIdDoc.usedBy).toBe(type);

                expect(isNonEmptyString(updatedIdDoc.timeUsed)).toBe(true);
            });
        });

        describe('an attempt to use an ID that is already in use', () => {
            it('should fail', async () => {
                const res = await request(app.getHttpServer()).post(`/ids`);

                const id = res.text;

                const type = AggregateType.term;

                // use the ID for the first time
                await idManager.use({ id, type });

                expect.assertions(1);

                try {
                    // attempt to use the ID for a second time
                    await idManager.use({ id, type });
                } catch (error) {
                    expect(error).toBeInstanceOf(InternalError);
                }
            });
        });
    });

    describe('IdManagementService.status', () => {
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

                    const type = AggregateType.vocabularyList;

                    await idManager.use({ id, type });

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
});
