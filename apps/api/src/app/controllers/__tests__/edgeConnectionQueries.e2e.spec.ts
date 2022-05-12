import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { isDeepStrictEqual } from 'util';
import { EdgeConnectionType } from '../../../domain/models/context/edge-connection.entity';
import { isResourceCompositeIdentifier } from '../../../domain/models/types/ResourceCompositeIdentifier';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import formatResourceCompositeIdentifier from '../../../view-models/presentation/formatResourceCompositeIdentifier';
import httpStatusCodes from '../../constants/httpStatusCodes';
import createTestModule from './createTestModule';
describe('When querying for edge connections', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    let app: INestApplication;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    const { connections, tags: tagTestData } = buildTestData();

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

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`GET /connections/`, () => {
        it('should return the correct count', async () => {
            const expectedResult = {
                count: connections.length,
            };

            await testRepositoryProvider.getEdgeConnectionRepository().createMany(connections);

            await testRepositoryProvider.getTagRepository().createMany(tagTestData);

            const result = await request(app.getHttpServer()).get(`/connections`);

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body).toEqual(expectedResult);
        });
    });

    describe(`GET /connections/notes`, () => {
        it('should return the expected result', async () => {
            await testRepositoryProvider.getEdgeConnectionRepository().createMany(connections);

            await testRepositoryProvider.getTagRepository().createMany(tagTestData);

            const result = await request(app.getHttpServer()).get('/connections/notes');

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body?.length).toBe(connections.length);

            expect(result.body).toMatchSnapshot();
        });
    });

    describe(`GET /connections/selfNotes`, () => {
        describe(`when the resource composite id is valid`, () => {
            Object.values(resourceTypes).forEach((resourceType) =>
                describe(`for a resource of type: ${resourceType}`, () => {
                    it(`should return the expected result`, async () => {
                        await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .createMany(connections);

                        await testRepositoryProvider.getTagRepository().createMany(tagTestData);

                        const selfConnections = connections.filter(
                            ({ type }) => type === EdgeConnectionType.self
                        );

                        const compositeIdToQuery = selfConnections
                            .flatMap(({ members }) => members)
                            .find(
                                ({ compositeIdentifier: { type } }) => type === resourceType
                            )?.compositeIdentifier;

                        if (!isResourceCompositeIdentifier(compositeIdToQuery)) {
                            throw new InternalError(
                                `Failed to find a self edge for: ${formatResourceCompositeIdentifier(
                                    compositeIdToQuery
                                )}`
                            );
                        }

                        const expectedSelfConnectionsForTheGivenResource = selfConnections.filter(
                            ({ members }) =>
                                isDeepStrictEqual(
                                    members[0].compositeIdentifier,
                                    compositeIdToQuery
                                )
                        );

                        const expectedNumberOfFoundConnections =
                            expectedSelfConnectionsForTheGivenResource.length;

                        const { id, type } = compositeIdToQuery;

                        const queryResult = await request(app.getHttpServer())
                            .get('/connections/selfNotes')
                            .query({
                                id,
                                type,
                            });

                        expect(queryResult.status).toBe(httpStatusCodes.ok);

                        expect(queryResult.body.length).toBe(expectedNumberOfFoundConnections);

                        expect(queryResult.body).toMatchSnapshot();
                    });
                })
            );
        });

        describe(`when the id for the resource is invalid`, () => {
            it(`should return a 500`, async () => {
                return await request(app.getHttpServer())
                    .get('/connections/selfNotes')
                    .query({
                        id: { num: 8900 },
                        type: resourceTypes.photograph,
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });

        describe(`when the type for the resource is invalid`, () => {
            it(`should return a 500`, async () => {
                return await request(app.getHttpServer())
                    .get('/connections/selfNotes')
                    .query({
                        id: '1',
                        type: 'BOGUS-RESOURCE-TYPE',
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });
    });

    describe(`GET /connections/forResource`, () => {
        describe(`when the id for the resource is invalid`, () => {
            it(`should return a 500`, async () => {
                return await request(app.getHttpServer())
                    .get('/connections/forResource')
                    .query({
                        id: { num: 8900 },
                        type: resourceTypes.photograph,
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });

        describe(`when the type for the resource is invalid`, () => {
            it(`should return a 500`, async () => {
                return await request(app.getHttpServer())
                    .get('/connections/forResource')
                    .query({
                        id: '1',
                        type: 'BOGUS-RESOURCE-TYPE',
                    })
                    .expect(httpStatusCodes.badRequest);
            });
        });

        describe(`when the composite id for the resource is valid`, () => {
            Object.values(resourceTypes).forEach((resourceType) =>
                describe(`for a resource of type: ${resourceType}`, () => {
                    it(`should return the expected result`, async () => {
                        await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .createMany(connections);

                        await testRepositoryProvider.getTagRepository().createMany(tagTestData);

                        const dualConnections = connections.filter(
                            ({ type }) => type === EdgeConnectionType.dual
                        );

                        const compositeIdentifierToQuery = dualConnections
                            .flatMap(({ members }) => members)
                            .map(({ compositeIdentifier }) => compositeIdentifier)
                            .find(({ type }) => type === resourceType);

                        if (!isResourceCompositeIdentifier(compositeIdentifierToQuery)) {
                            throw new InternalError(
                                `Failed to find a dual connection for resource of type: ${resourceType}`
                            );
                        }

                        const expectedNumberOfResults = dualConnections.filter(({ members }) =>
                            members.some(({ compositeIdentifier }) =>
                                isDeepStrictEqual(compositeIdentifier, compositeIdentifierToQuery)
                            )
                        ).length;

                        const { id, type } = compositeIdentifierToQuery;

                        const result = await request(app.getHttpServer())
                            .get('/connections/forResource')
                            .query({
                                id,
                                type,
                            });

                        expect(result.status).toBe(httpStatusCodes.ok);

                        expect(result.body?.length).toBe(expectedNumberOfResults);

                        expect(result.body).toMatchSnapshot();
                    });
                })
            );
        });
    });
});
