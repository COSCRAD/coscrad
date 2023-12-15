import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
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
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { TermCreated } from '../create-term';
import { AddAudioForTerm } from './add-audio-for-term.command';
import { AudioAddedForTerm } from './audio-added-for-term.event';

const commandType = `ADD_AUDIO_FOR_TERM`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
});

const termCompositeIdentifier = {
    type: AggregateType.term,
    id: buildDummyUuid(22),
};

const existingTerm = Term.fromEventHistory(
    termCreated.as(termCompositeIdentifier),
    termCompositeIdentifier.id
) as Term;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddAudioForTerm>;

const validPayload: AddAudioForTerm = clonePlainObjectWithOverrides(dummyFsa.payload, {
    aggregateCompositeIdentifier: termCompositeIdentifier,
    audioItemId: existingAudioItem.id,
});

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

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

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.audioItem]: [existingAudioItem],
                            [AggregateType.term]: [existingTerm],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: termId },
                }: AddAudioForTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .fetchById(termId);

                    expect(searchResult).toBeInstanceOf(Term);

                    const term = searchResult as Term;

                    expect(term.audioItemId).toBe(existingAudioItem.id);

                    assertEventRecordPersisted(term, `AUDIO_ADDED_FOR_TERM`, dummySystemUserId);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the term does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(existingTerm.getCompositeIdentifier()),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.term]: [existingTerm],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingTerm.getCompositeIdentifier(),
                                    [existingAudioItem.getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the term already has audio`, () => {
            const audioAddedForTerm = termCreated.andThen<AudioAddedForTerm>({
                type: `AUDIO_ADDED_FOR_TERM`,
                payload: {
                    audioItemId: existingAudioItem.id,
                },
            });

            const existingTermWithAudio = Term.fromEventHistory(
                audioAddedForTerm.as(existingTerm.getCompositeIdentifier()),
                existingTerm.id
            ) as Term;

            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.term]: [existingTermWithAudio],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validCommandFSA,
                });
            });
        });
    });
});