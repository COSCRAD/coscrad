import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ResourceType } from '../../../domain/types/ResourceType';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { AggregateInfo } from '../../../view-models/resourceDescriptions/types/AggregateInfo';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';
describe('GET /resources', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    beforeAll(async () => {
        ({ app } = await setUpIntegrationTest({
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

        const body = result.body as AggregateInfo[];

        // TODO [optimization]: avoid loop within loop here
        const isThereAnEntryForEveryResourceType = Object.values(ResourceType).every(
            (resourceType) =>
                body.some(({ type: responseResourceType }) => resourceType === responseResourceType)
        );

        expect(isThereAnEntryForEveryResourceType).toBe(true);
    });

    it('should return the expected result', async () => {
        const result = await request(app.getHttpServer()).get('/resources');

        expect(result.body).toMatchSnapshot();
    });

    afterAll(async () => {
        await app.close();
    });
});
