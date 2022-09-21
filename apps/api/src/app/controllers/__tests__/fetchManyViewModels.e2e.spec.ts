import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { Resource } from '../../../domain/models/resource.entity';
import { GrantResourceReadAccessToUserCommandHandler } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command-handler';
import { InMemorySnapshotOfResources, ResourceType } from '../../../domain/types/ResourceType';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When fetching multiple resources', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    const testData = buildTestData();

    const tagTestData = testData.tag;

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
        ({ app, commandHandlerService, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
        }));

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182576828]
         * We should use the real app module to dynamically discover all
         * commands.
         */
        commandHandlerService.registerHandler(
            'GRANT_RESOURCE_READ_ACCESS_TO_USER',
            new GrantResourceReadAccessToUserCommandHandler(testRepositoryProvider, idManager)
        );
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
        await app.close();
    });
});
