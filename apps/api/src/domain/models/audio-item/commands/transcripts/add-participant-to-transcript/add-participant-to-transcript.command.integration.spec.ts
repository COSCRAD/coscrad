import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { NotFound } from '../../../../../../lib/types/not-found';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import formatAggregateType from '../../../../../../view-models/presentation/formatAggregateType';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
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

const existingAudioItemWithParticipant = existingAudioItem.addParticipantToTranscript(
    existingTranscriptParticipant
) as unknown as AudioItem;

const buildValidCommandFSA = (
    validInstance: AudioItem | Video
): FluxStandardAction<AddParticipantToTranscript> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier:
            validInstance.getCompositeIdentifier() as AggregateCompositeIdentifier<AudiovisualResourceType>,
        name: `Long Talkin' Johnny`,
        initials: 'LTJ',
    },
});

const audioItemWithParticipantInitialsAlready = existingAudioItem.clone({
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

const audioItemWithParticipantNameAlready = existingAudioItem.clone({
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

const systemUserId = buildDummyUuid(456);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.audioItem]: [existingAudioItem],
}).fetchFullSnapshotInLegacyFormat();

describe(`The command: ${commandType}`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    const existingAudiovisualItems = [existingAudioItem, existingVideo];

    describe(`when the command is valid`, () => {
        existingAudiovisualItems.forEach((item) => {
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

                                expect(transcriptSearchResult).toBeInstanceOf(AudioItem);

                                const audioItem = transcriptSearchResult as AudioItem;

                                const participantSearchResult =
                                    audioItem.transcript.findParticipantByInitials(
                                        validCommandFSA.payload.initials
                                    );

                                // Shouldn't be `NotFound`
                                expect(participantSearchResult).toBeInstanceOf(
                                    TranscriptParticipant
                                );

                                assertEventRecordPersisted(
                                    audioItem,
                                    'PARTICIPANT_ADDED_TO_TRANSCRIPT',
                                    systemUserId
                                );
                            },
                        });
                    });
                });

                describe(`when there is already one participant transcript for the audio item`, () => {
                    it(`should succeed with the expected database updates`, async () => {
                        await assertCommandSuccess(assertionHelperDependencies, {
                            buildValidCommandFSA: () => validCommandFSA,
                            systemUserId,
                            initialState: new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItemWithParticipant],
                            }).fetchFullSnapshotInLegacyFormat(),
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { id },
                            }: AddParticipantToTranscript) => {
                                const transcriptSearchResult = await testRepositoryProvider
                                    .forResource(AggregateType.audioItem)
                                    .fetchById(id);

                                expect(transcriptSearchResult).not.toBe(NotFound);

                                expect(transcriptSearchResult).toBeInstanceOf(AudioItem);

                                const audioItem = transcriptSearchResult as AudioItem;

                                const participantSearchResult =
                                    audioItem.transcript.findParticipantByInitials(
                                        validCommandFSA.payload.initials
                                    );

                                // Shouldn't be `NotFound`
                                expect(participantSearchResult).toBeInstanceOf(
                                    TranscriptParticipant
                                );

                                assertEventRecordPersisted(
                                    audioItem,
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

        describe(`when there is no audio item with the given ID`, () => {
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
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [audioItemWithParticipantInitialsAlready],
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
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [audioItemWithParticipantNameAlready],
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
                        [AggregateType.audioItem]: [
                            existingAudioItem.clone({
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
