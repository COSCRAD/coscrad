import { isNonEmptyString, isUUID } from '@coscrad/validation-constraints';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdRepository } from '../../../lib/id-generation/interfaces/id-repository.interface';
import { UuidDocument } from '../../../lib/id-generation/types/UuidDocument';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoIdRepository } from '../../../persistence/repositories/arango-id-repository';
import setUpIntegrationTest from '../__tests__/setUpIntegrationTest';

describe('POST /ids', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idRepository: IIdRepository;

    beforeAll(async () => {
        ({ app, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        idRepository = new ArangoIdRepository(databaseProvider);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when generating a new ID`, () => {
        it('should generate a UUID with the correct format', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const doesNewIdHaveUuidFormat = isUUID(res.text);

            expect(doesNewIdHaveUuidFormat).toBe(true);
        });

        it('should correctly persist the ID in the database', async () => {
            const res = await request(app.getHttpServer()).post(`/ids`);

            const persistedId = (await idRepository.fetchById(res.text)) as UuidDocument;

            expect(persistedId.id).toBe(res.text);

            expect(persistedId.usedBy).toBeUndefined();

            expect(isNonEmptyString(persistedId.timeGenerated)).toBe(true);

            expect(persistedId.timeUsed).toBeUndefined();
        });
    });
});
