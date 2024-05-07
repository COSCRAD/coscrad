import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { EdgeConnection } from '../../edge-connection.entity';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { NoteTranslated } from './note-translated.event';
import { TranslateNote } from './translate-note.command';

const commandType = 'TRANSLATE_NOTE';

const edgeConnectionId = buildDummyUuid(1);

const edgeConnectionCompositeIdentifier = {
    type: AggregateType.note,
    id: edgeConnectionId,
};

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationNoteText = 'translation of the note';

const noteAboutReourceCreated = new TestEventStream().andThen<NoteAboutResourceCreated>({
    type: 'NOTE_ABOUT_RESOURCE_CREATED',
    payload: {
        languageCode: originalLanguageCode,
    },
});

const _noteTranslated = noteAboutReourceCreated.andThen<NoteTranslated>({
    type: 'NOTE_TRANSLATED',
    payload: {
        aggregateCompositeIdentifier: edgeConnectionCompositeIdentifier,
        languageCode: translationLanguageCode,
        text: translationNoteText,
    },
});

const validPayload: TranslateNote = {
    aggregateCompositeIdentifier: edgeConnectionCompositeIdentifier,
    languageCode: translationLanguageCode,
    text: translationNoteText,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const _fsaFactory = new DummyCommandFsaFactory(() => validCommandFSA);

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                seedInitialState: async () => {
                    const eventHistory = noteAboutReourceCreated.as(
                        edgeConnectionCompositeIdentifier
                    );

                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                checkStateOnSuccess: async () => {
                    const edgeConnectionnSearchResult = await testRepositoryProvider
                        .getEdgeConnectionRepository()
                        .fetchById(edgeConnectionId);

                    expect(edgeConnectionnSearchResult).toBeInstanceOf(EdgeConnection);
                },
            });
        });
    });
});
