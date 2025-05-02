import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../../queries/presentation/formatAggregateType';
import { TestEventStream } from '../../../../../../../test-data/events';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { AggregateCompositeIdentifier } from '../../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../../__tests__/utilities/buildDummyUuid';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import { AudioItemCreated } from '../../../../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudiovisualResourceType } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import {
    DuplicateTranscriptParticipantError,
    DuplicateTranscriptParticipantInitialsError,
    DuplicateTranscriptParticipantNameError,
} from '../../../../audio-item/errors';
import { VideoCreated } from '../../../../video';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../../../transcript-errors/cannot-add-participant-before-creating-transcript.error';
import { CreateTranscript } from '../create-transcript';
import { TranscriptCreated } from '../create-transcript/transcript-created.event';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';
import { ParticipantAddedToTranscript } from './participant-added-to-transcript.event';

type AudiovisualItem = AudioItem | Video;

const commandType = `ADD_PARTICIPANT_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const audioItemId = buildDummyUuid(1);

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const transcriptCreatedForAudio = audioItemCreated.andThen<TranscriptCreated>({
    type: 'TRANSCRIPT_CREATED',
});

const existingAudioItem = AudioItem.fromEventHistory(
    transcriptCreatedForAudio.as({
        type: AggregateType.audioItem,
        id: audioItemId,
    }),
    audioItemId
) as AudioItem;

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
});

const transcriptCreatedForVideo = videoCreated.andThen<TranscriptCreated>({
    type: 'TRANSCRIPT_CREATED',
});

const videoId = buildDummyUuid(5);

const existingVideo = Video.fromEventHistory(
    transcriptCreatedForVideo.as({
        type: AggregateType.video,
        id: videoId,
    }),
    videoId
) as Video;

const existingTranscriptParticipant = new TranscriptParticipant({
    initials: 'ABC',
    name: 'Aaron B. Cool',
});

const buildValidCommandFSA = (
    validInstance: AudiovisualItem
): FluxStandardAction<AddParticipantToTranscript> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier:
            validInstance.getCompositeIdentifier() as AggregateCompositeIdentifier<AudiovisualResourceType>,
        name: `Long Talkin' Johnny`,
        initials: 'LTJ',
    },
});

const systemUserId = buildDummyUuid(456);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.audioItem]: [existingAudioItem],
    [AggregateType.video]: [existingVideo],
}).fetchFullSnapshotInLegacyFormat();

describe(`The command: ${commandType}`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        describe(`when transcribing an audio item`, () => {
            const item = existingAudioItem;

            const validCommandFSA = buildValidCommandFSA(item);

            describe(`for a resource of type: ${formatAggregateType(
                AggregateType.audioItem
            )}`, () => {
                describe(`when there is not already a participant on the transcript`, () => {
                    it(`should succeed with the expected database updates`, async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            buildValidCommandFSA: () => validCommandFSA,
                            systemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    new DeluxeInMemoryStore(
                                        validInitialState
                                    ).fetchFullSnapshotInLegacyFormat()
                                );
                            },
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: AddParticipantToTranscript) => {
                                const transcriptSearchResult = await testRepositoryProvider
                                    .forResource(AggregateType.audioItem)
                                    .fetchById(id);

                                expect(transcriptSearchResult).not.toBe(NotFound);

                                expect(transcriptSearchResult).toBeInstanceOf(AudioItem);

                                const audiovisualItem = transcriptSearchResult as AudiovisualItem;

                                const participantSearchResult =
                                    audiovisualItem.transcript.findParticipantByInitials(
                                        validCommandFSA.payload.initials
                                    );

                                // Shouldn't be `NotFound`
                                expect(participantSearchResult).toBeInstanceOf(
                                    TranscriptParticipant
                                );

                                assertEventRecordPersisted(
                                    audiovisualItem,
                                    'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                                    systemUserId
                                );
                            },
                        });
                    });
                });

                describe(`when there is already one participant transcript for the audio item`, () => {
                    const instanceWithParticipantInitialsAlready = AudioItem.fromEventHistory(
                        transcriptCreatedForAudio
                            .andThen<ParticipantAddedToTranscript>({
                                type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                                payload: {
                                    initials: existingTranscriptParticipant.initials,
                                    name: existingTranscriptParticipant.name,
                                },
                            })
                            .as({
                                type: AggregateType.audioItem,
                                id: audioItemId,
                            }),
                        audioItemId
                    ) as AudioItem;

                    it(`should succeed with the expected database updates`, async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            buildValidCommandFSA: () => validCommandFSA,
                            systemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider.addFullSnapshot(
                                    new DeluxeInMemoryStore({
                                        [instanceWithParticipantInitialsAlready.type]: [
                                            instanceWithParticipantInitialsAlready,
                                        ],
                                    }).fetchFullSnapshotInLegacyFormat()
                                );
                            },
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: AddParticipantToTranscript) => {
                                const transcriptSearchResult = await testRepositoryProvider
                                    .forResource(instanceWithParticipantInitialsAlready.type)
                                    .fetchById(id);

                                expect(transcriptSearchResult).not.toBe(NotFound);

                                expect(transcriptSearchResult).toBeInstanceOf(AudioItem);

                                const audiovisualItem = transcriptSearchResult as AudiovisualItem;

                                const participantSearchResult =
                                    audiovisualItem.transcript.findParticipantByInitials(
                                        validCommandFSA.payload.initials
                                    );

                                // Shouldn't be `NotFound`
                                expect(participantSearchResult).toBeInstanceOf(
                                    TranscriptParticipant
                                );

                                /**
                                 * note that `assertEventRecordPersisted` does not currently support
                                 * having multiple events of the same type, so we don't check this here.
                                 *
                                 * TODO update this util to use a more flexible API (IOC)
                                 */
                            },
                        });
                    });
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        const item = existingAudioItem;

        const validCommandFSA = buildValidCommandFSA(item);

        describe(`when the payload has an invalid type`, () => {
            describe('when the command payload type is invalid', () => {
                generateCommandFuzzTestCases(CreateTranscript).forEach(
                    ({ description, propertyName, invalidValue }) => {
                        describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                            it('should fail with the appropriate error', async () => {
                                await assertCommandFailsDueToTypeError(
                                    assertionHelperDependencies,
                                    { propertyName, invalidValue },
                                    validCommandFSA
                                );
                            });
                        });
                    }
                );
            });
        });

        describe(`when there is no ${formatAggregateType(item.type)} with the given ID`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    validCommandFSA.payload.aggregateCompositeIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when there is already a participant with the given initials`, () => {
            const instanceWithParticipantInitialsAlready = AudioItem.fromEventHistory(
                transcriptCreatedForAudio
                    .andThen<ParticipantAddedToTranscript>({
                        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                        payload: {
                            initials: validCommandFSA.payload.initials,
                        },
                    })
                    .as({
                        type: AggregateType.audioItem,
                        id: audioItemId,
                    }),
                audioItemId
            ) as AudioItem;

            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [item.type]: [instanceWithParticipantInitialsAlready],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    systemUserId,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new DuplicateTranscriptParticipantError([
                                    new DuplicateTranscriptParticipantInitialsError(
                                        validCommandFSA.payload.initials
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when there is already a participant with the given name`, () => {
            const instanceWithParticipantNameAlready = AudioItem.fromEventHistory(
                transcriptCreatedForAudio
                    .andThen<ParticipantAddedToTranscript>({
                        type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                        payload: {
                            name: validCommandFSA.payload.name,
                        },
                    })
                    .as({
                        type: AggregateType.audioItem,
                        id: audioItemId,
                    }),
                audioItemId
            ) as AudioItem;

            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [item.type]: [instanceWithParticipantNameAlready],
                    }).fetchFullSnapshotInLegacyFormat(),
                    systemUserId,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new DuplicateTranscriptParticipantError([
                                    new DuplicateTranscriptParticipantNameError(
                                        validCommandFSA.payload.name
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item does not yet have a transcript`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [item.type]: [
                                    AudioItem.fromEventHistory(
                                        audioItemCreated.as({
                                            type: AggregateType.audioItem,
                                            id: audioItemId,
                                        }),
                                        audioItemId
                                    ) as AudioItem,
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddParticipantBeforeCreatingTranscriptError(
                                    validCommandFSA.payload.aggregateCompositeIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
