import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import {
    MultiLingualText,
    MultiLingualTextItemRole,
} from '../../../../../common/entities/multi-lingual-text';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFSAFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptLineItemOutOfBoundsError } from '../../../errors';
import { CannotAddInconsistentLineItemError } from '../../../errors/transcript-line-item/cannot-add-inconsistent-line-item.error';
import { TranscriptParticipantInitialsNotRegisteredError } from '../../../errors/transcript-participant-initials-not-registered.error';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';

const commandType = `ADD_LINE_ITEM_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid(464);

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const [audioStart, audioEnd] = existingAudioItem.getTimeBounds();

const audioLength = audioEnd - audioStart;

const numberOfTimestampsToGenerate = 10;

// offset to avoid collisions
const epsilon = 0.0001;

const allTimestamps = Array(numberOfTimestampsToGenerate)
    .fill(0)
    .map((_, index) => [
        audioStart + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
        audioStart + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
    ]);

const dummyText = new MultiLingualText({
    items: [
        {
            languageId: 'clc',
            text: 'lha lha lha',
            role: MultiLingualTextItemRole.original,
        },
        {
            languageId: 'eng',
            text: 'bla bla bla',
            role: MultiLingualTextItemRole.literalTranslation,
        },
    ],
}).toDTO();

const validCommandFSA: FluxStandardAction<AddLineItemToTranscript> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingAudioItem.getCompositeIdentifier(),
        inPointMilliseconds: allTimestamps[0][0],
        outPointMilliseconds: allTimestamps[0][1],
        text: dummyText,
        speakerInitials: existingAudioItem.transcript.participants[0].initials,
    },
};

const commandFSAFactory = new DummyCommandFSAFactory(() => validCommandFSA);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.audioItem]: [existingAudioItem],
}).fetchFullSnapshotInLegacyFormat();

describe(commandType, () => {
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

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected database udpates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                initialState: validInitialState,
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the refrenced audio item does not exist`, () => {
            it('should fail with the expected error', async () => {
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

        describe(`when the inPoint is out of bounds`, () => {
            it(`should fail with the expected error`, async () => {
                const inPointMilliseconds = existingAudioItem.lengthMilliseconds + 100;

                const outPointMilliseconds = existingAudioItem.lengthMilliseconds + 200;

                await assertCommandError(assertionHelperDependencies, {
                    systemUserId,
                    initialState: validInitialState,
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
                                        inPoint: inPointMilliseconds,
                                        outPoint: outPointMilliseconds,
                                        text: validCommandFSA.payload.text,
                                        speakerInitials: validCommandFSA.payload.speakerInitials,
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
                    initialState: validInitialState,
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
                                        inPoint: inPointMilliseconds,
                                        outPoint: outPointMilliseconds,
                                        text: validCommandFSA.payload.text,
                                        speakerInitials: validCommandFSA.payload.speakerInitials,
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
                    inPoint: inPointMilliseconds,
                    outPoint: outPointMilliseconds,
                    speakerInitials: validCommandFSA.payload.speakerInitials,
                    text: validCommandFSA.payload.text,
                });

                await assertCommandError(assertionHelperDependencies, {
                    systemUserId,
                    initialState: validInitialState,
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
                    initialState: validInitialState,
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
                                        inPoint: inPointMilliseconds,
                                        outPoint: outPointMilliseconds,
                                        speakerInitials: bogusInitials,
                                        text: validCommandFSA.payload.text,
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
    });
});