import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { isDeepStrictEqual } from 'util';
import { EdgeConnectionType } from '../../../domain/models/context/edge-connection.entity';
import { Resource } from '../../../domain/models/resource.entity';
import { isAggregateCompositeIdentifier } from '../../../domain/types/AggregateCompositeIdentifier';
import { InMemorySnapshot, ResourceType } from '../../../domain/types/ResourceType';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatResourceCompositeIdentifier from '../../../queries/presentation/formatAggregateCompositeIdentifier';
import buildTestData from '../../../test-data/buildTestData';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';

describe('When querying for edge connections', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    const rawSnapshot = buildTestData();

    /**
     * It's important to make sure all resources are published. If a resource
     * is not published, it is treated as not existing, in which case a
     * query for `selfNotes` or `relatedResources` will return `notFound`.
     */
    const fullSnapshot: InMemorySnapshot = {
        ...rawSnapshot,
        resources: Object.entries(rawSnapshot.resources).reduce(
            (acc, [resourceType, instances]): InMemorySnapshot =>
                ({
                    ...acc,
                    [resourceType]: instances.map((instance: Resource) =>
                        instance.clone({ published: true })
                    ),
                } as InMemorySnapshot),
            {}
        ),
    };

    const { note: connections } = buildTestData();

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        await testRepositoryProvider.testSetup();

        await testRepositoryProvider.addFullSnapshot(fullSnapshot);
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`GET /connections/`, () => {
        it('should return the correct schema', async () => {
            const result = await request(app.getHttpServer()).get(`/connections`);

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body).toMatchSnapshot();
        });
    });

    describe(`GET /connections/notes`, () => {
        it('should return the expected result', async () => {
            const result = await request(app.getHttpServer()).get('/connections/notes');

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body.entities.length).toBe(connections.length);

            expect(result.body).toMatchSnapshot();
        });

        // TODO[https://www.pivotaltracker.com/story/show/184125150]
        it.todo('should not return actions to non-admin users');
    });

    /**
     * We removed this, currently unused, endpoint when refactoring to use
     * a proper query service (remove domain logic from the controller), so we are
     * skipping this test.
     */
    describe.skip(`GET /connections/selfNotes`, () => {
        describe(`when the resource composite id is valid`, () => {
            Object.values(ResourceType).forEach((resourceType) =>
                describe(`for a resource of type: ${resourceType}`, () => {
                    it(`should return the expected result`, async () => {
                        const selfConnections = connections.filter(
                            ({ connectionType: type }) => type === EdgeConnectionType.self
                        );

                        const compositeIdToQuery = selfConnections
                            .flatMap(({ members }) => members)
                            .find(
                                ({ compositeIdentifier: { type } }) => type === resourceType
                            )?.compositeIdentifier;

                        if (!isAggregateCompositeIdentifier(compositeIdToQuery)) {
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

                        expect(queryResult.body.entities.length).toBe(
                            expectedNumberOfFoundConnections
                        );

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
                        type: ResourceType.photograph,
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

    /**
     * We removed this, currently unused, endpoint when refactoring to use
     * a proper query service (remove domain logic from the controller), so we are
     * skipping this test.
     */
    describe.skip(`GET /connections/forResource`, () => {
        describe(`when the id for the resource is invalid`, () => {
            it(`should return a 500`, async () => {
                return await request(app.getHttpServer())
                    .get('/connections/forResource')
                    .query({
                        id: { num: 8900 },
                        type: ResourceType.photograph,
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
            Object.values(ResourceType).forEach((resourceType) =>
                describe(`for a resource of type: ${resourceType}`, () => {
                    it(`should return the expected result`, async () => {
                        const dualConnections = connections.filter(
                            ({ connectionType: type }) => type === EdgeConnectionType.dual
                        );

                        const compositeIdentifierToQuery = dualConnections
                            .flatMap(({ members }) => members)
                            .map(({ compositeIdentifier }) => compositeIdentifier)
                            .find(({ type }) => type === resourceType);

                        if (!isAggregateCompositeIdentifier(compositeIdentifierToQuery)) {
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
