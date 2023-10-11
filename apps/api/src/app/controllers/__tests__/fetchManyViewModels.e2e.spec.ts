import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../domain/models/__tests__/utilities/dummySystemUserId';
import { Resource } from '../../../domain/models/resource.entity';
import { ResourcePublished } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshotOfResources, ResourceType } from '../../../domain/types/ResourceType';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { IEventRepository } from '../../../persistence/repositories/arango-command-repository-for-aggregate-root';
import { ArangoEventRepository } from '../../../persistence/repositories/arango-event-repository';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When fetching multiple resources', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let eventRepository: IEventRepository;

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
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        eventRepository = app.get(ArangoEventRepository);
    });

    const resourceTypesThatHaveStandaloneQueryTests = [
        AggregateType.digitalText,

        // TODO add standalone query test for song
        AggregateType.song,
    ];

    Object.values(ResourceType)
        // TODO [https://www.pivotaltracker.com/story/show/185903292] opt-in to tests for event-sourced aggregates as well
        .filter((resourceType) => !resourceTypesThatHaveStandaloneQueryTests.includes(resourceType))
        .forEach((resourceType) => {
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

                        const songIds = testDataWithAllResourcesPublished.song
                            .map((song) => song.getCompositeIdentifier())
                            .map(({ id }) => id);

                        // TODO Make this a more natural part of the test setup
                        const songPublishedEvents = songIds.map(
                            (id, index) =>
                                new ResourcePublished(
                                    {
                                        aggregateCompositeIdentifier: {
                                            id,
                                            type: AggregateType.song,
                                        },
                                    },
                                    buildDummyUuid(100 + index),
                                    dummySystemUserId
                                )
                        );

                        await Promise.all(
                            songPublishedEvents.map((event) => eventRepository.appendEvent(event))
                        );

                        await testRepositoryProvider.getTagRepository().createMany(tagTestData);
                    });

                    it(`should fetch multiple resources of type ${resourceType}`, async () => {
                        const res = await request(app.getHttpServer()).get(endpointUnderTest);

                        expect(res.status).toBe(httpStatusCodes.ok);

                        expect(res.body.entities.length).toBe(
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
                                // TODO Seed state via commands or events
                                eventHistory:
                                    instance.type === AggregateType.song
                                        ? [
                                              clonePlainObjectWithOverrides(
                                                  instance.eventHistory[0],
                                                  {
                                                      payload: {
                                                          aggregateCompositeIdentifier: {
                                                              id: `UNPUBLISHED-00${index + 1}`,
                                                          },
                                                      },
                                                  }
                                              ),
                                          ]
                                        : [],
                            })
                        );

                    beforeEach(async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                resources: {
                                    ...testDataWithAllResourcesPublished,
                                    [resourceType]: [
                                        ...unpublishedResourcesToAdd,
                                        ...publishedResourcesToAdd,
                                    ],
                                },
                                [AggregateType.tag]: tagTestData,
                            }).fetchFullSnapshotInLegacyFormat()
                        );

                        const publishedSongIds = publishedResourcesToAdd
                            .map((song) => song.getCompositeIdentifier())
                            .map(({ id }) => id);

                        // TODO [https://www.pivotaltracker.com/story/show/185903292] Make this a more natural part of the test setup
                        const songPublishedEvents = publishedSongIds.map(
                            (id, index) =>
                                new ResourcePublished(
                                    {
                                        aggregateCompositeIdentifier: {
                                            id,
                                            type: AggregateType.song,
                                        },
                                    },
                                    buildDummyUuid(100 + index),
                                    dummySystemUserId
                                )
                        );

                        await Promise.all(
                            songPublishedEvents.map((event) => eventRepository.appendEvent(event))
                        );
                    });

                    it('should return the expected number of results', async () => {
                        const res = await request(app.getHttpServer()).get(endpointUnderTest);

                        expect(res.body.entities.length).toBe(publishedResourcesToAdd.length);

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

        databaseProvider.close();
    });
});
