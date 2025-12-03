import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourcesConnectedWithNote } from '../../../domain/models/context/commands/connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from '../../../domain/models/context/commands/create-note-about-resource/note-about-resource-created.event';
import { ResourceType } from '../../../domain/types/ResourceType';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../test-data/utilities';
import httpStatusCodes from '../../constants/httpStatusCodes';
import setUpIntegrationTest from './setUpIntegrationTest';

const generalContext = {
    type: 'general',
};

describe('When querying for edge connections', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    const noteCreationEvents = [1, 2, 3].map((n) =>
        buildTestInstance(NoteAboutResourceCreated, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: buildDummyUuid(n),
                },
                resourceCompositeIdentifier: {
                    // TODO use different resource types
                    type: ResourceType.term,
                    id: buildDummyUuid(10 + n),
                },
                resourceContext: generalContext,
            },
        })
    );

    const connectionCreationEvents = [4, 5, 6].map((n) =>
        buildTestInstance(ResourcesConnectedWithNote, {
            payload: {
                aggregateCompositeIdentifier: {
                    id: buildDummyUuid(n),
                },
                fromMemberCompositeIdentifier: {
                    type: ResourceType.song,
                    id: buildDummyUuid(20 + n),
                },
                fromMemberContext: generalContext,
                toMemberCompositeIdentifier: {
                    type: ResourceType.digitalText,
                    id: buildDummyUuid(30 + n),
                },
                toMemberContext: generalContext,
            },
        })
    );

    beforeAll(async () => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        await testRepositoryProvider.testSetup();

        await testRepositoryProvider
            .getEventRepository()
            .appendEvents([...noteCreationEvents, ...connectionCreationEvents]);
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

            // TODO remove this
            expect(1).toBe(2);
        });
    });

    describe(`GET /connections/notes`, () => {
        it('should return the expected result', async () => {
            const result = await request(app.getHttpServer()).get('/connections/notes');

            expect(result.status).toBe(httpStatusCodes.ok);

            expect(result.body.entities.length).toBe(
                noteCreationEvents.length + connectionCreationEvents.length
            );

            expect(result.body).toMatchSnapshot();
        });

        // TODO[https://www.pivotaltracker.com/story/show/184125150]
        it.todo('should not return actions to non-admin users');
    });
});
