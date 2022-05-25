import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import { ResourceDescriptionAndLink } from '../../../view-models/resourceDescriptions/buildAllResourceDescriptions';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setupIntegrationTest from './setupIntegrationTest';
describe('GET /resources', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    beforeAll(async () => {
        ({ app, arangoConnectionProvider } = await setupIntegrationTest({
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

        const body = result.body as ResourceDescriptionAndLink[];

        // TODO [optimization]: avoid loop within loop here
        const isThereAnEntryForEveryResourceType = Object.values(resourceTypes).every(
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
