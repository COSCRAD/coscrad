import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { isNotFound, NotFound } from '../../lib/types/not-found';
import cloneToPlainObject from '../../lib/utilities/cloneToPlainObject';
import buildTestData from '../../test-data/buildTestData';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository provider > getEdgeConnectionRepository', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    beforeAll(async () => {
        ({ app, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await testRepositoryProvider.testTeardown();

        await app.close();
    });

    const { connections, resources } = testData;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await testRepositoryProvider.addResourcesOfManyTypes(resources);

        await testRepositoryProvider.getEdgeConnectionRepository().createMany(connections);
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('fetchMany', () => {
        it('should return all edge connections', async () => {
            const fetchManyResult = await testRepositoryProvider
                .getEdgeConnectionRepository()
                .fetchMany();

            expect(cloneToPlainObject(fetchManyResult)).toEqual(cloneToPlainObject(connections));
        });
    });

    describe('getCount', () => {
        it('should return the correct number of edge connections', async () => {
            const count = await testRepositoryProvider.getEdgeConnectionRepository().getCount();

            const expectedCount = connections.length;

            expect(count).toBe(expectedCount);
        });
    });

    describe('fetchById', () => {
        describe('when there is no edge connection with the given id', () => {
            it('should return NotFound', async () => {
                const result = await testRepositoryProvider
                    .getEdgeConnectionRepository()
                    .fetchById('bogus-id-193949');

                expect(result).toBe(NotFound);
            });
        });

        connections.forEach((connection) =>
            describe(`when there is an edge connection with the given id: ${connection.id}`, () => {
                it('should return the entity', async () => {
                    const expectedResult = connections.find(
                        ({ id: testInstanceId }) => testInstanceId === connection.id
                    );

                    const actualResult = await testRepositoryProvider
                        .getEdgeConnectionRepository()
                        .fetchById(connection.id);

                    // In case expectedResult didn't find anything with the search
                    expect(actualResult).toBeTruthy();

                    expect(actualResult).toBeInstanceOf(EdgeConnection);

                    const resultAsConnection = actualResult as EdgeConnection;

                    expect(resultAsConnection.toDTO()).toEqual(expectedResult.toDTO());
                });
            })
        );
    });

    describe('create', () => {
        it('should create a new edge resultAsConnection', async () => {
            const uniqueNewId = 'brand-new-id-123';

            const edgeConnectionToCreate = connections[0].clone({ id: uniqueNewId });

            await testRepositoryProvider
                .getEdgeConnectionRepository()
                .create(edgeConnectionToCreate);

            const fetchedInstance = await testRepositoryProvider
                .getEdgeConnectionRepository()
                .fetchById(uniqueNewId);

            expect(fetchedInstance).not.toBe(NotFound);

            expect(fetchedInstance).not.toBeInstanceOf(InternalError);

            // only occurs if test fails
            if (isNotFound(fetchedInstance) || isInternalError(fetchedInstance)) {
                throw new InternalError(`Instance was not fetched`);
            }

            // TODO add custom matcher for comparing instances
            expect(fetchedInstance.toDTO()).toEqual(edgeConnectionToCreate.toDTO());
        });
    });

    describe('createMany', () => {
        it('should create many new edge connections', async () => {
            const buildUniqueNewId = (index: number): string => `brand-new-id-${index + 1}`;

            const edgeConnectionsToCreate = connections
                .map((connection, index) =>
                    connection.clone({
                        id: buildUniqueNewId(index),
                    })
                )
                // keep the first 5 test instances
                .filter((_, index) => index < 5);

            await testRepositoryProvider
                .getEdgeConnectionRepository()
                .createMany(edgeConnectionsToCreate);

            const fetchedInstances = await Promise.all(
                edgeConnectionsToCreate.map(({ id }) =>
                    testRepositoryProvider.getEdgeConnectionRepository().fetchById(id)
                )
            );

            expect(fetchedInstances.every((instance) => instance instanceof EdgeConnection));

            edgeConnectionsToCreate.forEach((instance) => {
                const searchResult = fetchedInstances.find(
                    ({ id }: EdgeConnection) => instance.id === id
                );

                expect(searchResult).toBeTruthy();

                // TODO add custom matcher
                expect((searchResult as EdgeConnection).toDTO()).toEqual(instance.toDTO());
            });
        });
    });
});
