import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../../../validation';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { EdgeConnection } from '../../edge-connection.entity';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { GrantUserReadAccessToNote } from './grant-user-read-access-to-note.command';

const commandType = 'GRANT_USER_READ_ACCESS_TO_NOTE';

const userId = buildDummyUuid(1);

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandAssertionDependencies: CommandAssertionDependencies;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                PersistenceModule.forRootAsync(),
                DynamicDataTypeModule,
                EdgeConnectionModule,
            ],
            providers: [
                {
                    provide: TestRepositoryProvider,
                    useFactory: (
                        databaseProvider: ArangoDatabaseProvider,
                        dynamicDataTypeFinderService: DynamicDataTypeFinderService
                    ) =>
                        new TestRepositoryProvider(
                            databaseProvider,
                            new CoscradEventFactory(dynamicDataTypeFinderService),
                            dynamicDataTypeFinderService
                        ),
                    inject: [ArangoDatabaseProvider, DynamicDataTypeFinderService],
                },
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        commandAssertionDependencies = {
            testRepositoryProvider: app.get(TestRepositoryProvider),
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };

        databaseProvider = app.get(ArangoDatabaseProvider);
    });

    beforeEach(async () => {
        await commandAssertionDependencies.testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        await databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                userId,
            });

            const existingNoteId = buildDummyUuid(123);

            const eventHistoryForExistingNote = new TestEventStream()
                // there will be an empty ACL at this point
                .andThen<NoteAboutResourceCreated>({
                    type: 'NOTE_ABOUT_RESOURCE_CREATED',
                })
                .as({
                    id: existingNoteId,
                });

            const existingNote = EdgeConnection.fromEventHistory(
                eventHistoryForExistingNote,
                existingNoteId
            ) as EdgeConnection;

            await testRepositoryProvider.getEdgeConnectionRepository().create(existingNote);

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    Promise.resolve();
                },
                buildValidCommandFSA: () => ({
                    type: commandType,
                    payload: validPayload,
                }),
                checkStateOnSuccess: async () => {
                    const updatedNote = (await testRepositoryProvider
                        .getEdgeConnectionRepository()
                        .fetchById(existingNoteId)) as EdgeConnection;

                    expect(updatedNote.queryAccessControlList.canUser(userId)).toBe(true);

                    assertEventRecordPersisted(
                        updatedNote,
                        'NOTE_READ_ACCESS_GRANTED_TO_USER',
                        dummySystemUserId
                    );
                },
            });
        });
    });
});
