import { INestApplication } from '@nestjs/common';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from 'apps/api/src/persistence/repositories/__tests__/generateRandomTestDatabaseName';
import { buildAllEntityDescriptions } from 'apps/api/src/view-models/entityDescriptions/buildAllEntityDescriptions';
import * as request from 'supertest';
import createTestModule from './createTestModule';
describe('GET /entities/descriptions', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    beforeAll(async () => {
        const moduleRef = await createTestModule(testDatabaseName);

        arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        app = moduleRef.createNestApplication();

        await app.init();
    });

    it('should get the entity descriptions', () => {
        return request(app.getHttpServer())
            .get('/entities/descriptions')
            .expect(200)
            .expect(buildAllEntityDescriptions());
    });

    afterAll(async () => {
        await app.close();

        await arangoConnectionProvider.dropDatabaseIfExists();
    });
});
