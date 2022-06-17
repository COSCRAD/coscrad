import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Resource } from '../../../domain/models/resource.entity';
import { CreateSongCommandHandler } from '../../../domain/models/song/commands/create-song.command-handler';
import { PublishSongCommandHandler } from '../../../domain/models/song/commands/publish-song.command-handler';
import { InMemorySnapshotOfResources, ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildMockUuidGenerator from '../command/__tests__/buildMockUuidGenerator';
import buildViewModelPathForRe from '../utilities/buildViewModelPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('GET /resources (fetch view models)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    const testData = buildTestData();

    const tagTestData = testData.tags;

    const resourceTestData = testData.resources;

    const testDataWithAllResourcesPublished = Object.entries(resourceTestData).reduce(
        (accumulatedData: InMemorySnapshotOfResources, [Re, instances]) => ({
            ...accumulatedData,
            [Re]: instances.map((instance) =>
                instance.clone({
                    published: true,
                })
            ),
        }),
        {}
    );

    beforeAll(async () => {
        ({ app, arangoConnectionProvider, testRepositoryProvider, commandHandlerService } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
                BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
            }));

        commandHandlerService.registerHandler(
            'CREATE_SONG',
            new CreateSongCommandHandler(testRepositoryProvider, buildMockUuidGenerator())
        );

        commandHandlerService.registerHandler(
            'PUBLISH_SONG',
            new PublishSongCommandHandler(testRepositoryProvider, buildMockUuidGenerator())
        );
    });

    Object.values(ResourceType).forEach((resourceType) => {
        const endpointUnderTest = `/${buildViewModelPathForRe(resourceType)}`;

        const buildFullPathFromId = (id: string): string => `${endpointUnderTest}/${id}`;

        describe(`When querying for a single View Model by ID`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testSetup();
            });

            afterEach(async () => {
                await testRepositoryProvider.testTeardown();
            });
            describe(`GET ${endpointUnderTest}/:id`, () => {
                describe('when the resource is published', () => {
                    describe('when no resource with the id exists', () => {
                        beforeEach(async () => {
                            await testRepositoryProvider.addResourcesOfManyTypes(
                                testDataWithAllResourcesPublished
                            );

                            await testRepositoryProvider.getTagRepository().createMany(tagTestData);
                        });

                        it(`should return not found`, () => {
                            return request(app.getHttpServer())
                                .get(`/resources${buildFullPathFromId('bogus-id')}`)
                                .expect(httpStatusCodes.notFound);
                        });
                    });

                    describe('when an resource with the id is found', () => {
                        beforeEach(async () => {
                            await testRepositoryProvider.addResourcesOfManyTypes(
                                testDataWithAllResourcesPublished
                            );

                            await testRepositoryProvider.getTagRepository().createMany(tagTestData);
                        });

                        it('should return the expected response', async () => {
                            const resourceToFind =
                                testDataWithAllResourcesPublished[resourceType][0];

                            const res = await request(app.getHttpServer()).get(
                                `/resources${buildFullPathFromId(resourceToFind.id)}`
                            );

                            expect(res.status).toBe(httpStatusCodes.ok);

                            expect(res.body.data.id).toBe(resourceToFind.id);

                            expect(res.body).toMatchSnapshot();
                        });
                    });
                });

                describe('when an resource with the id is unpublished', () => {
                    const unpublishedId = 'unpublished-01';

                    beforeEach(async () => {
                        await testRepositoryProvider.addResourcesOfManyTypes(resourceTestData);

                        const unpublishedInstance = resourceTestData[resourceType][0].clone({
                            published: false,
                            id: unpublishedId,
                        });

                        await testRepositoryProvider.addResourcesOfSingleType(resourceType, [
                            unpublishedInstance,
                        ]);
                    });

                    it('should return not found', async () => {
                        const publishedAndUnpublishedInstancesFromRepo =
                            await testRepositoryProvider
                                .forResource(resourceType)
                                .fetchMany()
                                .then((result) =>
                                    result.filter(
                                        (singleInstance): singleInstance is Resource =>
                                            !isInternalError(singleInstance)
                                    )
                                );

                        /**
                         * Given 404 is not a very specific symptom, let's be sure the
                         * unpubished resource was in the db to start with
                         */
                        const isUnpublishedresourceIdInDB =
                            publishedAndUnpublishedInstancesFromRepo.some(
                                ({ id }) => id === unpublishedId
                            );

                        expect(isUnpublishedresourceIdInDB).toBe(true);

                        return request(app.getHttpServer())
                            .get(`/resources${buildFullPathFromId(unpublishedId)}`)
                            .expect(httpStatusCodes.notFound);
                    });
                });
            });
        });
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });
});
