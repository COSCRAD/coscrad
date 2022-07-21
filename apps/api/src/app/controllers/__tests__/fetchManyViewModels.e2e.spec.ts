import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Resource } from '../../../domain/models/resource.entity';
import { InMemorySnapshotOfResources, ResourceType } from '../../../domain/types/ResourceType';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When fetching multiple resources', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const testData = buildTestData();

    const tagTestData = testData.tags;

    const resourceTestData = testData.resources;

    const testDataWithAllResourcesPublished = Object.entries(resourceTestData).reduce(
        (accumulatedData: InMemorySnapshotOfResources, [ResourceType, instances]) => ({
            ...accumulatedData,
            [ResourceType]: instances.map((instance) =>
                instance.clone({
                    published: true,
                })
            ),
        }),
        {}
    );

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
        }));
    });

    Object.values(ResourceType).forEach((resourceType) => {
        const endpointUnderTest = `/${buildViewModelPathForResourceType(resourceType)}`;

        describe(`GET ${endpointUnderTest}`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testSetup();
            });

            afterEach(async () => {
                await testRepositoryProvider.testTeardown();
            });

            describe('when all of the resources are published', () => {
                beforeEach(async () => {
                    await testRepositoryProvider.addResourcesOfManyTypes(
                        testDataWithAllResourcesPublished
                    );

                    await testRepositoryProvider.getTagRepository().createMany(tagTestData);
                });

                it(`should fetch multiple resources of type ${resourceType}`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        `/resources${endpointUnderTest}`
                    );

                    expect(res.status).toBe(httpStatusCodes.ok);

                    expect(res.body.data.length).toBe(
                        testDataWithAllResourcesPublished[resourceType].length
                    );

                    expect(res.body).toMatchSnapshot();
                });
            });

            describe(`when some of the resources are unpublished`, () => {
                /**
                 * Note that there is no requirement that the test data have
                 * `published = true`
                 */
                const publishedResourcesToAdd = resourceTestData[resourceType].map(
                    (instance: Resource) =>
                        instance.clone({
                            published: true,
                        })
                );

                const unpublishedResourcesToAdd = resourceTestData[resourceType]
                    // We want a different number of published \ unpublished terms
                    .slice(0, -1)
                    .map((instance, index) =>
                        instance.clone({
                            id: `UNPUBLISHED-00${index + 1}`,
                            published: false,
                        })
                    );

                beforeEach(async () => {
                    await testRepositoryProvider.addResourcesOfSingleType(resourceType, [
                        ...unpublishedResourcesToAdd,
                        ...publishedResourcesToAdd,
                    ]);

                    await testRepositoryProvider.getTagRepository().createMany(tagTestData);
                });

                it('should return the expected number of results', async () => {
                    const res = await request(app.getHttpServer()).get(
                        `/resources${endpointUnderTest}`
                    );

                    expect(res.body.data.length).toBe(publishedResourcesToAdd.length);

                    // Sanity check
                    expect(publishedResourcesToAdd.length).not.toEqual(
                        unpublishedResourcesToAdd.length
                    );

                    expect(res.body).toMatchSnapshot();
                });
            });
        });
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });
});
