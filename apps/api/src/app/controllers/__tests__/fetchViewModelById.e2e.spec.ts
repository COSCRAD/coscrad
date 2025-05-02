import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Resource } from '../../../domain/models/resource.entity';
import idEquals from '../../../domain/models/shared/functional/idEquals';
import { InMemorySnapshotOfResources, ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

/**
 * TODO Rename this test `resource-queries.fetch-by-id.e2e.spec.ts`
 *
 * We eventually would like to write a one-off test for each resource type.
 * Further, we may want to move these query tests to a separate directory
 * or even project.
 *
 * We may want to move the test server out of process. I.e., we may want
 * to start the back-end independently and then query a live local instance
 * of the back-end. This may reduce performance costs of these tests, especially
 * known memory leaks in network bound test libraries.
 *
 * These are end-to-end tests of the back-end, in the sense
 * that they go from the API to the database. They are not end-to-end in
 * the sense of a Cypress test.
 */
describe('GET  (fetch view models)', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    const testData = buildTestData();

    const tagTestData = testData.tag;

    const resourceTestData = testData.resources;

    const resourceTypesThatHaveStandaloneQueryTests = [
        ResourceType.digitalText,

        ResourceType.term,
        ResourceType.vocabularyList,
        ResourceType.photograph,
        ResourceType.playlist,
        //TODO write standalone query test for these
        ResourceType.song,
        ResourceType.audioItem,
        ResourceType.video,
    ];

    const testDataWithAllResourcesPublished = Object.entries(resourceTestData).reduce(
        (accumulatedData: InMemorySnapshotOfResources, [resourceType, instances]) =>
            // We seed state differently for event-sourced aggregates
            resourceTypesThatHaveStandaloneQueryTests.includes(resourceType as ResourceType)
                ? accumulatedData
                : {
                      ...accumulatedData,
                      [resourceType]: instances.map((instance) =>
                          instance.clone({
                              published: true,
                          })
                      ),
                  },
        {}
    );

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
            BASE_URL: 'https://www.testapi.coscrad.org',
        }));
    });

    Object.values(ResourceType)
        // TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced resources in this test
        .filter((rt) => !resourceTypesThatHaveStandaloneQueryTests.includes(rt))
        .forEach((resourceType) => {
            const endpointUnderTest = `/${buildViewModelPathForResourceType(resourceType)}`;

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
                            // note that there is no data seeded in a beforeEach \ beforeAll

                            it(`should return not found`, () => {
                                return request(app.getHttpServer())
                                    .get(`${buildFullPathFromId('bogus-id')}`)
                                    .expect(httpStatusCodes.notFound);
                            });
                        });

                        describe('when an resource with the id exists', () => {
                            beforeEach(async () => {
                                await testRepositoryProvider.addResourcesOfManyTypes(
                                    testDataWithAllResourcesPublished
                                );

                                await testRepositoryProvider
                                    .getTagRepository()
                                    .createMany(tagTestData);
                            });

                            it('should return the expected response', async () => {
                                const resourceToFind =
                                    testDataWithAllResourcesPublished[resourceType][0];

                                const res = await request(app.getHttpServer()).get(
                                    `${buildFullPathFromId(resourceToFind.id)}`
                                );

                                expect(res.status).toBe(httpStatusCodes.ok);

                                expect(res.body.id).toBe(resourceToFind.id);

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
                                    idEquals(unpublishedId)
                                );

                            expect(isUnpublishedresourceIdInDB).toBe(true);

                            return request(app.getHttpServer())
                                .get(`${buildFullPathFromId(unpublishedId)}`)
                                .expect(httpStatusCodes.notFound);
                        });
                    });
                });
            });
        });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });
});
