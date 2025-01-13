import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { EdgeConnection } from '../../edge-connection.entity';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { NoteTranslated } from '../translate-note';
import { AddAudioForNote } from './add-audio-for-note.command';
import { AudioAddedForNote } from './audio-added-for-note.event';

const commandType = 'ADD_AUDIO_FOR_NOTE';

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddAudioForNote>;

const languageCodeForNote = LanguageCode.Chilcotin;

const languageCodeForNoteTranslation = LanguageCode.English;

const audioItemId = buildDummyUuid(112);

const noteAboutResourceCreated = new TestEventStream().andThen<NoteAboutResourceCreated>({
    type: 'NOTE_ABOUT_RESOURCE_CREATED',
    payload: {
        languageCode: languageCodeForNote,
    },
});

const noteTranslated = noteAboutResourceCreated.andThen<NoteTranslated>({
    type: 'NOTE_TRANSLATED',
    payload: {
        languageCode: languageCodeForNoteTranslation,
    },
});

const audioAddedForNote = noteTranslated.andThen<AudioAddedForNote>({
    type: 'AUDIO_ADDED_FOR_NOTE',
    payload: {
        audioItemId,
        languageCode: languageCodeForNote,
    },
});

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    id: audioItemId,
});

const edgeConnectionId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const aggregateCompositeIdentifier = {
    type: AggregateType.note,
    id: edgeConnectionId,
};

const commandFsaFactory = new DummyCommandFsaFactory<AddAudioForNote>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            languageCode: languageCodeForNote,
            audioItemId,
        },
    })
);

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

    const validEventHistoryForEdgeConnectionWithNoNoteTranslationAndNoAudio =
        noteAboutResourceCreated.as({
            id: edgeConnectionId,
        });

    describe(`when the command is valid`, () => {
        describe(`when the audio is for the original language`, () => {
            it(`should succeed`, async () => {
                const existingEdgeConnection = EdgeConnection.fromEventHistory(
                    validEventHistoryForEdgeConnectionWithNoNoteTranslationAndNoAudio,
                    edgeConnectionId
                );

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);

                        await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .create(existingEdgeConnection as EdgeConnection);
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: edgeConnectionId,
                            },
                            audioItemId,
                        }),
                    checkStateOnSuccess: async () => {
                        const edgeConnectionSearchResult = await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .fetchById(edgeConnectionId);

                        expect(edgeConnectionSearchResult).toBeInstanceOf(EdgeConnection);

                        const updatedEdgeConnection = edgeConnectionSearchResult as EdgeConnection;

                        const audioIdSearchResult =
                            updatedEdgeConnection.getAudioForNoteInLanguage(languageCodeForNote);

                        expect(audioIdSearchResult).toBe(audioItemId);

                        assertEventRecordPersisted(
                            updatedEdgeConnection,
                            'AUDIO_ADDED_FOR_NOTE',
                            dummySystemUserId
                        );
                    },
                });
            });
        });

        describe(`when the audio is for the translation language`, () => {
            it(`should succeed`, async () => {
                const noteTranslated = noteAboutResourceCreated.andThen<NoteTranslated>({
                    type: 'NOTE_TRANSLATED',
                    payload: {
                        languageCode: languageCodeForNoteTranslation,
                    },
                });

                const existingEdgeConnection = EdgeConnection.fromEventHistory(
                    noteTranslated.as({ id: edgeConnectionId, type: AggregateType.note }),
                    edgeConnectionId
                );

                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);

                        await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .create(existingEdgeConnection as EdgeConnection);
                    },
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: {
                                id: edgeConnectionId,
                            },
                            audioItemId,
                            languageCode: languageCodeForNoteTranslation,
                        }),
                    checkStateOnSuccess: async () => {
                        const edgeConnectionSearchResult = await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .fetchById(edgeConnectionId);

                        expect(edgeConnectionSearchResult).toBeInstanceOf(EdgeConnection);

                        const updatedEdgeConnection = edgeConnectionSearchResult as EdgeConnection;

                        const audioIdSearchResult = updatedEdgeConnection.getAudioForNoteInLanguage(
                            languageCodeForNoteTranslation
                        );

                        expect(audioIdSearchResult).toBe(audioItemId);

                        assertEventRecordPersisted(
                            updatedEdgeConnection,
                            'AUDIO_ADDED_FOR_NOTE',
                            dummySystemUserId
                        );
                    },
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the edge connection does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(aggregateCompositeIdentifier),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                const existingEdgeConnection = EdgeConnection.fromEventHistory(
                    validEventHistoryForEdgeConnectionWithNoNoteTranslationAndNoAudio,
                    edgeConnectionId
                ) as EdgeConnection;

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // await app
                        //     .get(ArangoEventRepository)
                        //     .appendEvents(
                        //         validEventHistoryForEdgeConnectionWithNoNoteTranslationAndNoAudio
                        //     );

                        await testRepositoryProvider
                            .getEdgeConnectionRepository()
                            .create(existingEdgeConnection);

                        // we do not add an existing audio item
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    aggregateCompositeIdentifier,
                                    [
                                        {
                                            type: AggregateType.audioItem,
                                            id: audioItemId,
                                        },
                                    ]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the note does not have a translation in the given language`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.audioItem)
                            .create(existingAudioItem);

                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                validEventHistoryForEdgeConnectionWithNoNoteTranslationAndNoAudio
                            );
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            languageCode: LanguageCode.Chinook,
                        }),
                });
            });
        });

        describe(`when there is already audio for this language`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(
                            audioAddedForNote.as({
                                type: AggregateType.note,
                                id: edgeConnectionId,
                            })
                        );

                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            languageCode: languageCodeForNote,
                        }),
                });
            });
        });
    });
});
