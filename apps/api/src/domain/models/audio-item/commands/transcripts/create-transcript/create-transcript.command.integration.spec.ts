import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../../lib/types/not-found';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../types/ResourceType';
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
import { AudioItem } from '../../../entities/audio-item.entity';
import { Transcript } from '../../../entities/transcript.entity';
import { CannotOverwriteTranscriptError } from '../../../errors';
import { CreateTranscript } from './create-transcript.command';

const commandType = `CREATE_TRANSCRIPT`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: undefined,
});

const validCommandFSA = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingAudioItem.getCompositeIdentifier(),
    },
};

const systemUserId = buildDummyUuid(555);

const validInitialState = new DeluxeInMemoryStore({
    resources: {
        [AggregateType.audioItem]: [existingAudioItem],
    },
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
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
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
        describe('when adding a transcript to an audio item', () => {
            it('should succeed with the expected database updates', async () => {
                await assertCommandSuccess(assertionHelperDependencies, {
                    systemUserId,
                    initialState: validInitialState,
                    buildValidCommandFSA: () => validCommandFSA,
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id },
                    }: CreateTranscript) => {
                        const audioItemSearchResult = await testRepositoryProvider
                            .forResource<AudioItem>(ResourceType.audioItem)
                            .fetchById(id);

                        expect(audioItemSearchResult).not.toBe(NotFound);

                        expect(audioItemSearchResult).not.toBeInstanceOf(InternalError);

                        const audioItem = audioItemSearchResult as unknown as AudioItem;

                        expect(audioItem.hasTranscript()).toBe(true);

                        assertEventRecordPersisted(audioItem, 'TRANSCRIPT_CREATED', systemUserId);
                    },
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

        describe(`when there is no audio item with the given aggregateCompositeIdentifier`, () => {
            it('should fail with the expected error', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    systemUserId,
                    initialState: new DeluxeInMemoryStore({
                        // empty- no existing audio items
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existingAudioItem.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item already has a transcript`, () => {
            it('should fail with the expected error', async () => {
                await assertCommandError(assertionHelperDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    systemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [
                            existingAudioItem.clone({
                                transcript: new Transcript({
                                    items: [],
                                    participants: [],
                                }),
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotOverwriteTranscriptError(
                                    existingAudioItem.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
