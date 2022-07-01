import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ResourceType } from '../../../domain/types/ResourceType';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import { ResourceDescription } from '../../../view-models/resourceDescriptions/buildAllResourceDescriptions';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';
describe('GET /resources', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    beforeAll(async () => {
        ({ app, arangoConnectionProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            GLOBAL_PREFIX: 'testApiPrefix',
        }));
    });

    it('should return a 200', async () => {
        const result = await request(app.getHttpServer()).get('/resources');

        expect(result.status).toBe(httpStatusCodes.ok);
    });

    it('should return one description for each resource type', async () => {
        const result = await request(app.getHttpServer()).get('/resources');

        const body = result.body as ResourceDescription[];

        // TODO [optimization]: avoid loop within loop here
        const isThereAnEntryForEveryResourceType = Object.values(ResourceType).every(
            (resourceType) =>
                body.some(
                    ({ resourceType: responseResourceType }) =>
                        resourceType === responseResourceType
                )
        );

        expect(isThereAnEntryForEveryResourceType).toBe(true);
    });

    it('should return the expected result', async () => {
        const result = await request(app.getHttpServer()).get('/resources');

        expect(result.body).toMatchSnapshot();
    });

    afterAll(async () => {
        await app.close();

        await arangoConnectionProvider.dropDatabaseIfExists();
    });
});
