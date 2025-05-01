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
import { VideoCreated } from '../../../../video';
import { Video } from '../../../../video/entities/video.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { LineItemAddedToTranscript } from '../add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../create-transcript/transcript-created.event';
import {
    CannotAddInconsistentLineItemError,
    FailedToImportLineItemsToTranscriptError,
} from '../errors';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

const commandType = `IMPORT_LINE_ITEMS_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid();

const validId = buildDummyUuid(1);

const audioItemCompositeId = {
    type: AggregateType.audioItem,
    id: validId,
};

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
});

const participantInitials = 'AB';

const participantName = 'Allen Ballen';

const transcriptCreated = audioItemCreated.andThen<TranscriptCreated>({
    type: 'TRANSCRIPT_CREATED',
});

/**
 * TODO Should we allow this command to "discover" the participants from the
 * data?
 */
const participantAdded = transcriptCreated.andThen<ParticipantAddedToTranscript>({
    type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
    payload: {
        initials: participantInitials,
        name: participantName,
    },
});

const existingAudioItem = AudioItem.fromEventHistory(
    participantAdded.as(audioItemCompositeId),
    validId
) as AudioItem;

const videoCreated = new TestEventStream().andThen<VideoCreated>({
    type: 'VIDEO_CREATED',
});

const videoCompositeId = {
    type: AggregateType.video,
    id: validId,
};

const existingVideo = Video.fromEventHistory(
    videoCreated
        .andThen<TranscriptCreated>({
            type: 'TRANSCRIPT_CREATED',
        })
        .andThen<ParticipantAddedToTranscript>({
            type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
            payload: {
                initials: participantInitials,
                name: participantName,
            },
        })
        .as(videoCompositeId),
    validId
) as Video;

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

    describe(`when importing line items to a transcript for a ${formatAggregateType(
        AggregateType.audioItem
    )}`, () => {
        const validInstance = existingAudioItem;

        const [startTime, endTime] = validInstance.getTimeBounds();

        const audioLength = endTime - startTime;

        const numberOfTimestampsToGenerate = 10;

        const epsilon = 0.0001;

        // TODO Test that this works if they are not sorted
        const allTimestamps = Array(numberOfTimestampsToGenerate)
            .fill(0)
            .map((_, index) => [
                startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
                startTime + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
            ]) as [number, number][];

        const buildDummyText = ([inPoint, outPoint]: [number, number]) =>
            `text for line item with time range: [${inPoint}, ${outPoint}]`;

        const buildLineItemForTimestamp = ([inPointMilliseconds, outPointMilliseconds]: [
            number,
            number
        ]) => ({
            inPointMilliseconds,
            outPointMilliseconds,
            text: buildDummyText([inPointMilliseconds, outPointMilliseconds]),
            languageCode,
            speakerInitials: validInstance.transcript.participants[0].initials,
        });

        const languageCode = LanguageCode.Chilcotin;

        const buildValidCommandFsa = (
            validInstance: AudioItem | Video
        ): FluxStandardAction<ImportLineItemsToTranscript> => ({
            type: commandType,
            payload: {
                aggregateCompositeIdentifier:
                    validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                        typeof ResourceType.audioItem | typeof ResourceType.video
                    >,
                lineItems: allTimestamps.map(buildLineItemForTimestamp),
            },
        });

        const validInitialState = new DeluxeInMemoryStore({
            [AggregateType.audioItem]: [validInstance],
        }).fetchFullSnapshotInLegacyFormat();

        const validCommandFsa = buildValidCommandFsa(validInstance);

        const commandFsaFactory = new DummyCommandFsaFactory(() => validCommandFsa);

        const seedInitialState = async () => {
            await testRepositoryProvider.addFullSnapshot(
                new DeluxeInMemoryStore(validInitialState).fetchFullSnapshotInLegacyFormat()
            );
        };

        describe(`when the command is valid`, () => {
            it(`should succeed wth the expected database updates`, async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId,
                    buildValidCommandFSA: () => validCommandFsa,
                    seedInitialState,
                });
            });
        });

        describe(`when the command is invalid`, () => {
            describe(`When there is overlap between the timestamps to import`, () => {
                const timeStampsWithOverlap: [number, number][] = [
                    [10, 20],
                    // overlaps the one above
                    [15, 30],
                    [77, 95],
                ];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: timeStampsWithOverlap.map(buildLineItemForTimestamp),
                            }),
                        checkError: (error) => {
                            expect(error).toBeInstanceOf(CommandExecutionError);

                            const { innerErrors } = error;

                            const { innerErrors: innerMostErrors } = innerErrors[0].innerErrors[0];

                            // We don't want to report overlaps twice for each pair
                            expect(innerMostErrors).toHaveLength(1);

                            //  TODO export specific errors and check for them here
                        },
                    });
                });
            });

            describe(`When there is overlap (two inPoints equal) between the timestamps to import`, () => {
                const timeStampsWithOverlap: [number, number][] = [
                    [1, 2],
                    // overlaps the one above
                    [15, 30],
                    [15, 95],
                ];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: timeStampsWithOverlap.map(buildLineItemForTimestamp),
                            }),
                        checkError: (error) => {
                            expect(error).toBeInstanceOf(CommandExecutionError);

                            const { innerErrors } = error;

                            const { innerErrors: innerMostErrors } = innerErrors[0].innerErrors[0];

                            // We don't want to report overlaps twice for each pair
                            expect(innerMostErrors).toHaveLength(1);

                            //  TODO export specific errors and check for them here
                        },
                    });
                });
            });

            describe(`When one of the timestamps to add overlaps an existing time stamp`, () => {
                const existingTimestamp: [number, number] = [12.4, 15];

                const overlappingTimestamp: [number, number] = [14.3, 20.3];

                const speakerInitials = validInstance.transcript.participants[0].initials;

                const inconsistentLineItem = new TranscriptItem({
                    inPointMilliseconds: overlappingTimestamp[0],
                    outPointMilliseconds: overlappingTimestamp[1],
                    text: buildMultilingualTextWithSingleItem(
                        `foo bar baz!`,
                        LanguageCode.Chilcotin
                    ),
                    speakerInitials,
                });

                it(`should fail with the expected error`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore({
                                    [AggregateType.audioItem]: [
                                        AudioItem.fromEventHistory(
                                            participantAdded
                                                .andThen<LineItemAddedToTranscript>({
                                                    type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
                                                    payload: {
                                                        inPointMilliseconds: existingTimestamp[0],
                                                        outPointMilliseconds: existingTimestamp[1],
                                                        speakerInitials: participantInitials,
                                                    },
                                                })
                                                .as(audioItemCompositeId),
                                            validId
                                        ) as AudioItem,
                                    ],
                                }).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: [
                                    {
                                        ...inconsistentLineItem,
                                        text: inconsistentLineItem.text.items[0].text,
                                        languageCode:
                                            inconsistentLineItem.text.items[0].languageCode,
                                    },
                                ],
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new FailedToImportLineItemsToTranscriptError([
                                        new CannotAddInconsistentLineItemError(
                                            inconsistentLineItem,
                                            []
                                        ),
                                    ]),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`When a time stamp is in the wrong order`, () => {
                const timeStampWithWrongOrder: [number, number] = [30, 15];

                const invalidTimestamps: [number, number][] = [
                    [1, 2],
                    timeStampWithWrongOrder,
                    [65, 95],
                ];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: invalidTimestamps.map(buildLineItemForTimestamp),
                            }),
                        checkError: (error) => {
                            expect(error).toBeInstanceOf(CommandExecutionError);

                            const { innerErrors } = error;

                            const { innerErrors: innerMostErrors } = innerErrors[0].innerErrors[0];

                            // We don't want to report overlaps twice for each pair
                            expect(innerMostErrors).toHaveLength(1);

                            //  TODO export specific errors and check for them here
                        },
                    });
                });
            });

            const invalidPoint = validInstance.getTimeBounds()[1] + 100;

            describe(`when the in-point is out of bounds for one of the items`, () => {
                const invalidTimeStamps: [number, number][] = [
                    [1, 2],
                    [invalidPoint, invalidPoint + 1],
                ];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: invalidTimeStamps.map(buildLineItemForTimestamp),
                            }),
                    });
                });
            });

            describe(`when the out-point is out of bounds for one of the items`, () => {
                const invalidTimeStamps: [number, number][] = [
                    [1, 2],
                    [5, invalidPoint],
                ];

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: invalidTimeStamps.map(buildLineItemForTimestamp),
                            }),
                    });
                });
            });

            describe(`when the refrenced ${formatAggregateType(
                AggregateType.audioItem
            )} does not exist`, () => {
                it('should fail with the expected error', async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(
                                new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat()
                            );
                        },
                        buildCommandFSA: () => validCommandFsa,
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError(
                                        validInstance.getCompositeIdentifier()
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when one of the line items references an unregistered participant by initials`, () => {
                const initialState = new DeluxeInMemoryStore({
                    [AggregateType.audioItem]: [
                        AudioItem.fromEventHistory(
                            // no participants have been added at this point
                            transcriptCreated.as(audioItemCompositeId),
                            validId
                        ) as AudioItem,
                    ],
                }).fetchFullSnapshotInLegacyFormat();

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(initialState);
                        },
                        buildCommandFSA: () => validCommandFsa,
                    });
                });
            });

            /**
             * This would be a pointless command as nothing would be updated.
             */
            describe(`when line items is an empty array`, () => {
                it(`should fail with the expected error`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState,
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                lineItems: [],
                            }),
                    });
                });
            });

            describe('when the command payload type is invalid', () => {
                generateCommandFuzzTestCases(ImportLineItemsToTranscript).forEach(
                    ({ description, propertyName, invalidValue }) => {
                        describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                            it('should fail with the appropriate error', async () => {
                                const invalidFsa = commandFsaFactory.build(buildDummyUuid(789), {
                                    [propertyName]: invalidValue,
                                });

                                if (description.includes('whiteSpaceOnlyString')) {
                                    console.log({ invalidFsa: JSON.stringify(invalidFsa) });
                                }

                                await assertCommandFailsDueToTypeError(
                                    assertionHelperDependencies,
                                    { propertyName, invalidValue },
                                    invalidFsa
                                );
                            });
                        });
                    }
                );
            });

            /**
             * The command requires non-empty string `text` and a valid
             * `languageCode`. It appends a valid `original` item as
             * `MultilingualText` `name`. Therefore, it is impossible to introduce
             * complex invariant errors related to multilingual text on line items
             * via this command.
             */
        });
    });

    describe(`when importing line items to a transcript for a ${formatAggregateType(
        AggregateType.video
    )}`, () => {
        const validInstance = existingVideo;

        const [startTime, endTime] = validInstance.getTimeBounds();

        const audioLength = endTime - startTime;

        const numberOfTimestampsToGenerate = 10;

        const epsilon = 0.0001;

        // TODO Test that this works if they are not sorted
        const allTimestamps = Array(numberOfTimestampsToGenerate)
            .fill(0)
            .map((_, index) => [
                startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
                startTime + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
            ]) as [number, number][];

        const buildDummyText = ([inPoint, outPoint]: [number, number]) =>
            `text for line item with time range: [${inPoint}, ${outPoint}]`;

        const buildLineItemForTimestamp = ([inPointMilliseconds, outPointMilliseconds]: [
            number,
            number
        ]) => ({
            inPointMilliseconds,
            outPointMilliseconds,
            text: buildDummyText([inPointMilliseconds, outPointMilliseconds]),
            languageCode,
            speakerInitials: validInstance.transcript.participants[0].initials,
        });

        const languageCode = LanguageCode.Chilcotin;

        // TODO share the test setup
        const buildValidCommandFsa = (
            validInstance: AudioItem | Video
        ): FluxStandardAction<ImportLineItemsToTranscript> => ({
            type: commandType,
            payload: {
                aggregateCompositeIdentifier:
                    validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                        typeof ResourceType.audioItem | typeof ResourceType.video
                    >,
                lineItems: allTimestamps.map(buildLineItemForTimestamp),
            },
        });

        const validCommandFsa = buildValidCommandFsa(validInstance);

        describe(`when the command is valid`, () => {
            it(`should succeed with the expected database updates`, async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId,
                    buildValidCommandFSA: () => validCommandFsa,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                video: [existingVideo],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                });
            });
        });
    });
});
