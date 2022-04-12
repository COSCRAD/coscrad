import { INestApplication } from '@nestjs/common';
import { Resource } from 'apps/api/src/domain/models/resource.entity';
import {
    InMemorySnapshot,
    ResourceType,
    resourceTypes,
} from 'apps/api/src/domain/types/resourceTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import TestRepositoryProvider from 'apps/api/src/persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from 'apps/api/src/test-data/buildTestData';
import * as request from 'supertest';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
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

    const testDataWithAllResourcesPublished = Object.entries(testData).reduce(
        (accumulatedData: InMemorySnapshot, [Re, instances]) => ({
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

    // These resources are always published
    const resourceTypesToExclude: ResourceType[] = [resourceTypes.tag];

    Object.values(resourceTypes)
        .filter((Re) => !resourceTypesToExclude.includes(Re))
        .forEach((Re) => {
            const endpointUnderTest = `/${buildViewModelPathForRe(Re)}`;

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
                            });

                            it('should return the expected response', async () => {
                                const resourceToFind = testDataWithAllResourcesPublished[Re][0];

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
                            await testRepositoryProvider.addEntitiesOfManyTypes(testData);

                            const unpublishedInstance = testData[Re][0].clone({
                                published: false,
                                id: unpublishedId,
                            });

                            await testRepositoryProvider.addEntitiesOfSingleType(Re, [
                                unpublishedInstance,
                            ]);
                        });

                        it('should return not found', async () => {
                            const publishedAndUnpublishedInstancesFromRepo =
                                await testRepositoryProvider
                                    .forResource(Re)
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
