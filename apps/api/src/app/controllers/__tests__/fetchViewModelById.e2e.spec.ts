import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Resource } from '../../../domain/models/resource.entity';
import { InMemorySnapshotOfResources, resourceTypes } from '../../../domain/types/resourceTypes';
import { isInternalError } from '../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForRe from '../utilities/buildViewModelPathForResourceType';
import createTestModule from './createTestModule';

describe('GET /resources (fetch view models)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

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
        jest.resetModules();

        const moduleRef = await createTestModule(testDatabaseName);

        arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new DatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        app = moduleRef.createNestApplication();

        await app.init();
    });

    Object.values(resourceTypes).forEach((resourceType) => {
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
                            await testRepositoryProvider.addEntitiesOfManyTypes(
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
                            await testRepositoryProvider.addEntitiesOfManyTypes(
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

                            expect(res.body.id).toBe(resourceToFind.id);

                            expect(res.body).toMatchSnapshot();
                        });
                    });
                });

                describe('when an resource with the id is unpublished', () => {
                    const unpublishedId = 'unpublished-01';

                    beforeEach(async () => {
                        await testRepositoryProvider.addEntitiesOfManyTypes(resourceTestData);

                        const unpublishedInstance = resourceTestData[resourceType][0].clone({
                            published: false,
                            id: unpublishedId,
                        });

                        await testRepositoryProvider.addEntitiesOfSingleType(resourceType, [
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
