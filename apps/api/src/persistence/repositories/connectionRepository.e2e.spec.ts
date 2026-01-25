import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourcesConnectedWithNote } from '../../domain/models/context/commands/connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from '../../domain/models/context/commands/create-note-about-resource/note-about-resource-created.event';
import { EdgeConnection } from '../../domain/models/context/edge-connection.entity';
import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { NotFound, isNotFound } from '../../lib/types/not-found';
import { buildTestInstance } from '../../test-data/utilities';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';

/**
 * We may not want to test this as it constitutes testing implementation details.
 * Do we havve complete coverage of the repository through the command and e2e
 * tests? If so, we should stick with those to avoid being bogged down when refactoring.
 */
describe.skip('Repository provider > getEdgeConnectionRepository', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    beforeAll(async () => {
        // TODO remove the use of the deprecated test setup helper
        ({ app, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await app.close();
    });

    const edgeIds = [1, 2].map(buildDummyUuid);

    const creationEvents = [
        buildTestInstance(NoteAboutResourceCreated, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: edgeIds[0],
                },
            },
        }),
        buildTestInstance(ResourcesConnectedWithNote, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: edgeIds[1],
                },
            },
        }),
    ];

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await testRepositoryProvider.getEventRepository().appendEvents(creationEvents);
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('fetchMany', () => {
        it('should return all edge connections', async () => {
            const fetchManyResult = await testRepositoryProvider
                .getEdgeConnectionRepository()
                .fetchMany();

            fetchManyResult.forEach((r) => {
                expect(r).toBeInstanceOf(EdgeConnection);
            });

            expect(fetchManyResult).toHaveLength(creationEvents.length);
        });
    });

    describe('getCount', () => {
        it('should return the correct number of edge connections', async () => {
            const count = await testRepositoryProvider.getEdgeConnectionRepository().getCount();

            const expectedCount = creationEvents.length;

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

        edgeIds.forEach((edgeId) =>
            describe(`when there is an edge connection with the given id: ${edgeId}`, () => {
                it('should return the entity', async () => {
                    const actualResult = await testRepositoryProvider
                        .getEdgeConnectionRepository()
                        .fetchById(edgeId);

                    // In case expectedResult didn't find anything with the search
                    expect(actualResult).toBeTruthy();

                    expect(actualResult).toBeInstanceOf(EdgeConnection);
                });
            })
        );
    });

    describe('create', () => {
        it('should create a new edge connection', async () => {
            const uniqueNewId = 'brand-new-id-123';

            const edgeConnectionToCreate = EdgeConnection.fromEventHistory(
                creationEvents,
                edgeIds[0]
            ) as EdgeConnection;

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
            await testRepositoryProvider.getEventRepository().appendEvents(creationEvents);

            const fetchedInstances = await testRepositoryProvider
                .getEdgeConnectionRepository()
                .fetchMany();

            expect(fetchedInstances.every((instance) => instance instanceof EdgeConnection));
        });
    });
});
