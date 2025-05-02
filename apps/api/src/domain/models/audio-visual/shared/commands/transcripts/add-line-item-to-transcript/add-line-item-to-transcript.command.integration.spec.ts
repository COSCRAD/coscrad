import {
    AggregateType,
    LanguageCode,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../../queries/presentation/formatAggregateType';
import { TestEventStream } from '../../../../../../../test-data/events';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import { AudioItemCreated } from '../../../../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { TranscriptLineItemOutOfBoundsError } from '../../../../audio-item/errors';
import { VideoCreated } from '../../../../video';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipantInitialsNotRegisteredError } from '../../../transcript-errors/transcript-participant-initials-not-registered.error';
import { ParticipantAddedToTranscript } from '../add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../create-transcript/transcript-created.event';
import { CannotAddInconsistentLineItemError } from '../errors';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';
import { LineItemAddedToTranscript } from './line-item-added-to-transcript.event';

const validId = buildDummyUuid(1);

const commandType = `ADD_LINE_ITEM_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid(464);

const audioCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
});

describe(commandType, () => {
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

    // audio items
    describe(`when transcribing a ${formatAggregateType(AggregateType.audioItem)}`, () => {
        const eventHistory = audioCreated
            .andThen<TranscriptCreated>({
                type: 'TRANSCRIPT_CREATED',
            })
            .andThen<ParticipantAddedToTranscript>({
                type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                payload: {
                    initials: 'AP',
                },
            });

        const existingAudioItem = AudioItem.fromEventHistory(
            eventHistory.as({
                type: AggregateType.audioItem,
                id: validId,
            }),
            validId
        ) as AudioItem;

        const [startTime, endTime] = existingAudioItem.getTimeBounds();

        const audioLength = endTime - startTime;

        const numberOfTimestampsToGenerate = 10;

        // offset to avoid collisions
        const epsilon = 0.0001;

        const allTimestamps = Array(numberOfTimestampsToGenerate)
            .fill(0)
            .map((_, index) => [
                startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
                startTime + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
            ]);

        const dummyText = 'bla bla bla';

        const languageCode = LanguageCode.Chilcotin;

        const multilingualText = buildMultilingualTextWithSingleItem(dummyText, languageCode);

        const buildValidCommandFSA = (
            validInstance: AudioItem | Video
        ): FluxStandardAction<AddLineItemToTranscript> => ({
            type: commandType,
            payload: {
                aggregateCompositeIdentifier:
                    validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                        typeof ResourceType.audioItem | typeof ResourceType.video
                    >,
                inPointMilliseconds: allTimestamps[0][0],
                outPointMilliseconds: allTimestamps[0][1],
                text: dummyText,
                languageCode,
                speakerInitials: validInstance.transcript.participants[0].initials,
            },
        });

        const validInitialState = new DeluxeInMemoryStore({
            [AggregateType.audioItem]: [existingAudioItem],
        }).fetchFullSnapshotInLegacyFormat();

        const validCommandFSA = buildValidCommandFSA(existingAudioItem);

        const commandFSAFactory = new DummyCommandFsaFactory(() => validCommandFSA);

        describe(`when the command is valid`, () => {
            it(`should succeed with the expected database udpates`, async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId,
                    buildValidCommandFSA: () => validCommandFSA,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore(
                                validInitialState
                            ).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                });
            });
        });

        describe(`when the command is invalid`, () => {
            describe('when the command payload type is invalid', () => {
                generateCommandFuzzTestCases(AddLineItemToTranscript).forEach(
                    ({ description, propertyName, invalidValue }) => {
                        describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                            it('should fail with the appropriate error', async () => {
                                await assertCommandFailsDueToTypeError(
                                    assertionHelperDependencies,
                                    { propertyName, invalidValue },
                                    commandFSAFactory.build(buildDummyUuid(789), {
                                        [propertyName]: invalidValue,
                                    })
                                );
                            });
                        });
                    }
                );
            });

            describe(`when the referenced ${formatAggregateType(
                AggregateType.audioItem
            )} does not exist`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            return Promise.resolve();
                        },
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

            describe(`when the inPoint is out of bounds`, () => {
                it(`should fail with the expected error`, async () => {
                    const inPointMilliseconds = existingAudioItem.lengthMilliseconds + 100;

                    const outPointMilliseconds = existingAudioItem.lengthMilliseconds + 200;

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore(
                                    validInitialState
                                ).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFSAFactory.build(null, {
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new TranscriptLineItemOutOfBoundsError(
                                        new TranscriptItem({
                                            inPointMilliseconds: inPointMilliseconds,
                                            outPointMilliseconds: outPointMilliseconds,
                                            text: multilingualText,
                                            speakerInitials:
                                                validCommandFSA.payload.speakerInitials,
                                        }),
                                        existingAudioItem.getTimeBounds()
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the outPoint is out of bounds`, () => {
                it(`should fail with the expected error`, async () => {
                    const inPointMilliseconds = 1;

                    const outPointMilliseconds = existingAudioItem.lengthMilliseconds + 1;

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore(
                                    validInitialState
                                ).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFSAFactory.build(null, {
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new TranscriptLineItemOutOfBoundsError(
                                        new TranscriptItem({
                                            inPointMilliseconds: inPointMilliseconds,
                                            outPointMilliseconds: outPointMilliseconds,
                                            text: multilingualText,
                                            speakerInitials:
                                                validCommandFSA.payload.speakerInitials,
                                        }),
                                        existingAudioItem.getTimeBounds()
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the inPoint and outPoint are out of order`, () => {
                it(`should fail with the expected error`, async () => {
                    const inPointMilliseconds = existingAudioItem.lengthMilliseconds / 2;

                    // outPoint is within bounds, but smaller than inPoint
                    const outPointMilliseconds = existingAudioItem.lengthMilliseconds / 4;

                    const newLineItem = new TranscriptItem({
                        inPointMilliseconds: inPointMilliseconds,
                        outPointMilliseconds: outPointMilliseconds,
                        speakerInitials: validCommandFSA.payload.speakerInitials,
                        text: multilingualText,
                    });

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore(
                                    validInitialState
                                ).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFSAFactory.build(null, {
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotAddInconsistentLineItemError(newLineItem, [
                                        // TODO validate nested innerErrors further
                                    ]),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the initials are not registered`, () => {
                it(`should fail with the expected error`, async () => {
                    const bogusInitials = 'BOGUS';

                    const inPointMilliseconds = existingAudioItem.lengthMilliseconds / 4;

                    const outPointMilliseconds = existingAudioItem.lengthMilliseconds / 2;

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore(
                                    validInitialState
                                ).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFSAFactory.build(null, {
                                speakerInitials: bogusInitials,
                                inPointMilliseconds,
                                outPointMilliseconds,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotAddInconsistentLineItemError(
                                        new TranscriptItem({
                                            inPointMilliseconds: inPointMilliseconds,
                                            outPointMilliseconds: outPointMilliseconds,
                                            speakerInitials: bogusInitials,
                                            text: multilingualText,
                                        }),
                                        [
                                            new TranscriptParticipantInitialsNotRegisteredError(
                                                bogusInitials
                                            ),
                                        ]
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when the timestamp for the new line item overlaps with an existing item`, () => {
                it(`should fail with the expected errors`, async () => {
                    const existingTimestamp: [number, number] = [12.4, 15];

                    const overlappingTimestamp: [number, number] = [14.3, 20.3];

                    const newText = `foo bar baz!`;

                    const speakerInitials = existingAudioItem.transcript.participants[0].initials;

                    const inconsistentLineItem = new TranscriptItem({
                        inPointMilliseconds: overlappingTimestamp[0],
                        outPointMilliseconds: overlappingTimestamp[1],
                        text: buildMultilingualTextWithSingleItem(newText, languageCode),
                        speakerInitials,
                    });

                    const existingInstanceWithTranscriptItemsThatConflict =
                        AudioItem.fromEventHistory(
                            eventHistory
                                .andThen<LineItemAddedToTranscript>({
                                    type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
                                    payload: {
                                        inPointMilliseconds: existingTimestamp[0],
                                        outPointMilliseconds: existingTimestamp[1],
                                        text: 'text for existing item',
                                        languageCode: LanguageCode.Chilcotin,
                                    },
                                })
                                .as({
                                    type: AggregateType.audioItem,
                                    id: validId,
                                }),
                            validId
                        ) as AudioItem;

                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore({
                                    [AggregateType.audioItem]: [
                                        existingInstanceWithTranscriptItemsThatConflict,
                                    ],
                                }).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFSAFactory.build(undefined, {
                                inPointMilliseconds: overlappingTimestamp[0],
                                outPointMilliseconds: overlappingTimestamp[1],
                                languageCode,
                                text: newText,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new CannotAddInconsistentLineItemError(
                                        inconsistentLineItem,
                                        []
                                    ),
                                ])
                            );
                        },
                    });
                });
            });
        });
    });

    describe(`when transcribing a ${formatAggregateType(AggregateType.video)}`, () => {
        const eventHistory = videoCreated
            .andThen<TranscriptCreated>({
                type: 'TRANSCRIPT_CREATED',
            })
            .andThen<ParticipantAddedToTranscript>({
                type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                payload: {
                    initials: 'AP',
                },
            });

        const existingVideo = Video.fromEventHistory(
            eventHistory.as({
                type: AggregateType.video,
                id: validId,
            }),
            validId
        ) as Video;

        const [startTime, endTime] = existingVideo.getTimeBounds();

        const videoLength = endTime - startTime;

        const numberOfTimestampsToGenerate = 10;

        // offset to avoid collisions
        const epsilon = 0.0001;

        const allTimestamps = Array(numberOfTimestampsToGenerate)
            .fill(0)
            .map((_, index) => [
                startTime + epsilon + (index * videoLength) / numberOfTimestampsToGenerate,
                startTime + ((index + 1) * videoLength) / numberOfTimestampsToGenerate - epsilon,
            ]);

        const dummyText = 'bla bla bla';

        const languageCode = LanguageCode.Chilcotin;

        // TODO factor this out to be shared
        const buildValidCommandFSA = (
            validInstance: AudioItem | Video
        ): FluxStandardAction<AddLineItemToTranscript> => ({
            type: commandType,
            payload: {
                aggregateCompositeIdentifier:
                    validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                        typeof ResourceType.audioItem | typeof ResourceType.video
                    >,
                inPointMilliseconds: allTimestamps[0][0],
                outPointMilliseconds: allTimestamps[0][1],
                text: dummyText,
                languageCode,
                speakerInitials: validInstance.transcript.participants[0].initials,
            },
        });

        const validInitialState = new DeluxeInMemoryStore({
            [AggregateType.audioItem]: [existingVideo],
        }).fetchFullSnapshotInLegacyFormat();

        const validCommandFSA = buildValidCommandFSA(existingVideo);

        describe(`when the command is valid`, () => {
            it(`should succeed with the expected database udpates`, async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId,
                    buildValidCommandFSA: () => validCommandFSA,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore(
                                validInitialState
                            ).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                });
            });
        });
    });
});
