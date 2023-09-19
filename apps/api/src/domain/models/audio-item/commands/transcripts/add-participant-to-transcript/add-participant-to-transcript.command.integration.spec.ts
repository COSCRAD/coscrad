import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../view-models/presentation/formatAggregateType';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { AudiovisualResourceType } from '../../../entities/audio-item-composite-identifier';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { Video } from '../../../entities/video.entity';
import {
    DuplicateTranscriptParticipantError,
    DuplicateTranscriptParticipantInitialsError,
    DuplicateTranscriptParticipantNameError,
} from '../../../errors';
import { CannotAddParticipantBeforeCreatingTranscriptError } from '../../../errors/CannotAddParticipantBeforeCreatingTranscript.error';
import { CreateTranscript } from '../create-transcript';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';

type AudiovisualItem = AudioItem | Video;

const commandType = `ADD_PARTICIPANT_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const buildEmptyTranscript = () =>
    new Transcript({
        items: [],
        participants: [],
    });

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: buildEmptyTranscript(),
});

const existingVideo = getValidAggregateInstanceForTest(AggregateType.video).clone({
    transcript: buildEmptyTranscript(),
});

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

    const existingAudiovisualItemsAndCtors: [AudiovisualItem, unknown][] = [
        [existingAudioItem, AudioItem],
        [existingVideo, Video],
    ];

    describe(`when the command is valid`, () => {
        existingAudiovisualItemsAndCtors.forEach(([item, Ctor]) => {
            const validCommandFSA = buildValidCommandFSA(item);

            describe(`for a resource of type: ${formatAggregateType(item.type)}`, () => {
                describe(`when there is not already a participant on the transcript`, () => {
                    it(`should succeed with the expected database updates`, async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            buildValidCommandFSA: () => validCommandFSA,
                            systemUserId,
                            initialState: validInitialState,
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: AddParticipantToTranscript) => {
                                const transcriptSearchResult = await testRepositoryProvider
                                    .forResource(item.type)
                                    .fetchById(id);

                                expect(transcriptSearchResult).not.toBe(NotFound);

                                expect(transcriptSearchResult).toBeInstanceOf(Ctor);

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
                    const instanceWithParticipantInitialsAlready = item.clone({
                        transcript: {
                            items: [],
                            participants: [existingTranscriptParticipant],
                        },
                    });

                    it(`should succeed with the expected database updates`, async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            buildValidCommandFSA: () => validCommandFSA,
                            systemUserId,
                            initialState: new DeluxeInMemoryStore({
                                [instanceWithParticipantInitialsAlready.type]: [
                                    instanceWithParticipantInitialsAlready,
                                ],
                            }).fetchFullSnapshotInLegacyFormat(),
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: AddParticipantToTranscript) => {
                                const transcriptSearchResult = await testRepositoryProvider
                                    .forResource(instanceWithParticipantInitialsAlready.type)
                                    .fetchById(id);

                                expect(transcriptSearchResult).not.toBe(NotFound);

                                expect(transcriptSearchResult).toBeInstanceOf(Ctor);

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
            });
        });
    });

    describe(`when the command is invalid`, () => {
        existingAudiovisualItemsAndCtors.forEach(([item]) => {
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
                const instanceWithParticipantInitialsAlready = item.clone({
                    transcript: {
                        items: [],
                        participants: [
                            new TranscriptParticipant({
                                initials: validCommandFSA.payload.initials,
                                name: 'Bobby Dee',
                            }),
                        ],
                    },
                });

                it(`should fail with the expected errors`, async () => {
                    await assertCommandError(assertionHelperDependencies, {
                        buildCommandFSA: () => validCommandFSA,
                        initialState: new DeluxeInMemoryStore({
                            [item.type]: [instanceWithParticipantInitialsAlready],
                        }).fetchFullSnapshotInLegacyFormat(),
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
                const instanceWithParticipantNameAlready = item.clone({
                    transcript: {
                        items: [],
                        participants: [
                            new TranscriptParticipant({
                                initials: 'ABC',
                                name: validCommandFSA.payload.name,
                            }),
                        ],
                    },
                });

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
                        initialState: new DeluxeInMemoryStore({
                            [item.type]: [
                                item.clone({
                                    transcript: undefined,
                                }),
                            ],
                        }).fetchFullSnapshotInLegacyFormat(),
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
});
