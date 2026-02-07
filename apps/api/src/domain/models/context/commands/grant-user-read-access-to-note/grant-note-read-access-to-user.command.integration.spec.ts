import { AggregateType, CoscradUserRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../../../validation';
import { CoscradEventFactory } from '../../../../common';
import { ID_MANAGER_TOKEN } from '../../../../interfaces/id-manager.interface';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import UserAlreadyHasReadAccessError from '../../../shared/common-command-errors/invalid-state-transition-errors/UserAlreadyHasReadAccessError';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { EdgeConnection } from '../../edge-connection.entity';
import { ResourcesConnectedWithNote } from '../connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { GrantUserReadAccessToNote } from './grant-note-read-access-to-user.command';
import { NoteReadAccessGrantedToUser } from './note-read-access-granted-to-user.event';

const commandType = 'GRANT_NOTE_READ_ACCESS_TO_USER';

const userId = buildDummyUuid(1);

const existingUser = buildTestInstance(CoscradUser, {
    id: userId,
    roles: [CoscradUserRole.viewer],
});

const existingNoteId = buildDummyUuid(123);

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandAssertionDependencies: CommandAssertionDependencies;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
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

        testRepositoryProvider = app.get(TestRepositoryProvider);
    });

    beforeEach(async () => {
        await commandAssertionDependencies.testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        await databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        describe(`when updating a simple note`, () => {
            it(`should succeed`, async () => {
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

                const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                    aggregateCompositeIdentifier: existingNote.getCompositeIdentifier(),
                    userId,
                });

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForExistingNote);

                        await testRepositoryProvider.getUserRepository().create(existingUser);
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

        describe(`when updating a connection`, () => {
            it(`should succeed`, async () => {
                const eventHistoryForExistingConnection = new TestEventStream()
                    // there will be an empty ACL at this point
                    .andThen<ResourcesConnectedWithNote>({
                        type: 'RESOURCES_CONNECTED_WITH_NOTE',
                    })
                    .as({
                        id: existingNoteId,
                    });

                const existingNote = EdgeConnection.fromEventHistory(
                    eventHistoryForExistingConnection,
                    existingNoteId
                ) as EdgeConnection;

                const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                    aggregateCompositeIdentifier: existingNote.getCompositeIdentifier(),
                    userId,
                });

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForExistingConnection);

                        await testRepositoryProvider.getUserRepository().create(existingUser);
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

    describe(`when the command is invalid`, () => {
        describe(`when the user does not exist`, () => {
            it(`should return the expected error response`, async () => {
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

                const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                    aggregateCompositeIdentifier: existingNote.getCompositeIdentifier(),
                    userId,
                });

                // we skip adding the user to the DB here
                // await testRepositoryProvider.getUserRepository().create(existingUser);

                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: () => ({
                        type: commandType,
                        payload: validPayload,
                    }),
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForExistingNote);
                    },
                    systemUserId: dummySystemUserId,
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingNote.getCompositeIdentifier(),
                                    [existingUser.getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the user already has read access`, () => {
            it(`should return the expected error response`, async () => {
                const eventHistoryForExistingNote = new TestEventStream()
                    // there will be an empty ACL at this point
                    .andThen<NoteAboutResourceCreated>(
                        {
                            type: 'NOTE_ABOUT_RESOURCE_CREATED',
                        },
                        NoteAboutResourceCreated
                    )
                    .andThen<NoteReadAccessGrantedToUser>(
                        {
                            type: 'NOTE_READ_ACCESS_GRANTED_TO_USER',
                            payload: {
                                userId,
                            },
                        },
                        NoteReadAccessGrantedToUser
                    )
                    .as({
                        id: existingNoteId,
                    });

                const existingNote = EdgeConnection.fromEventHistory(
                    eventHistoryForExistingNote,
                    existingNoteId
                ) as EdgeConnection;

                const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                    aggregateCompositeIdentifier: existingNote.getCompositeIdentifier(),
                    userId,
                });

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => ({
                        type: commandType,
                        payload: validPayload,
                    }),
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForExistingNote);

                        await testRepositoryProvider.getUserRepository().create(existingUser);
                    },
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new UserAlreadyHasReadAccessError(
                                    userId,
                                    existingNote.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the edge connection does not exist`, () => {
            it(`should return the expected error response`, async () => {
                const missingCompositeId = {
                    type: AggregateType.note,
                    id: buildDummyUuid(404),
                };

                const validPayload = buildTestInstance(GrantUserReadAccessToNote, {
                    aggregateCompositeIdentifier: missingCompositeId,
                    userId,
                });

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // no existing note is added

                        await testRepositoryProvider.getUserRepository().create(existingUser);
                    },
                    buildCommandFSA: () => ({
                        type: commandType,
                        payload: validPayload,
                    }),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new AggregateNotFoundError(missingCompositeId),
                            ])
                        );
                    },
                });
            });
        });
    });
});
