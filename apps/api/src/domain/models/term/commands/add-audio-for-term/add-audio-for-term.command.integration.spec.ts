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
import { Term } from '../../entities/term.entity';
import { TermCreated } from '../create-term';
import { TermTranslated } from '../translate-term';
import { AddAudioForTerm } from './add-audio-for-term.command';
import { AudioAddedForTerm } from './audio-added-for-term.event';

const commandType = `ADD_AUDIO_FOR_TERM`;

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const languageCodeForText = LanguageCode.Chilcotin;

const languageCodeForTextTranslation = LanguageCode.English;

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        languageCode: languageCodeForText,
    },
});

const termTranslated = termCreated.andThen<TermTranslated>({
    type: `TERM_TRANSLATED`,
    payload: {
        languageCode: languageCodeForTextTranslation,
    },
});

const termCompositeIdentifier = {
    type: AggregateType.term,
    id: buildDummyUuid(22),
};

const existingTerm = Term.fromEventHistory(
    termTranslated.as(termCompositeIdentifier),
    termCompositeIdentifier.id
) as Term;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddAudioForTerm>;

const validPayload: AddAudioForTerm = clonePlainObjectWithOverrides(dummyFsa.payload, {
    aggregateCompositeIdentifier: termCompositeIdentifier,
    audioItemId: existingAudioItem.id,
    languageCode: languageCodeForText,
});

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const fsaFactory = new DummyCommandFsaFactory(() => validCommandFSA);

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
        describe(`when the language is that of the original text`, () => {
            it(`should succeed with the expected database updates`, async () => {
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

                        expect(term.getIdForAudioIn(languageCodeForText)).toBe(
                            existingAudioItem.id
                        );

                        assertEventRecordPersisted(term, `AUDIO_ADDED_FOR_TERM`, dummySystemUserId);
                    },
                });
            });
        });

        describe(`when the language is that of the translation text`, () => {
            it(`should succeed with the expected database updates`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            languageCode: languageCodeForTextTranslation,
                        }),
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

                        expect(term.getIdForAudioIn(languageCodeForTextTranslation)).toBe(
                            existingAudioItem.id
                        );

                        assertEventRecordPersisted(term, `AUDIO_ADDED_FOR_TERM`, dummySystemUserId);
                    },
                });
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

        describe(`when the term already has audio for the given language`, () => {
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

        describe(`when the term already uses the given audio item`, () => {
            const audioAddedForTerm = termCreated.andThen<AudioAddedForTerm>({
                type: `AUDIO_ADDED_FOR_TERM`,
                payload: {
                    audioItemId: existingAudioItem.id,
                    languageCode: languageCodeForText,
                },
            });

            const existingTermWithAudio = Term.fromEventHistory(
                audioAddedForTerm.as(existingTerm.getCompositeIdentifier()),
                existingTerm.id
            ) as Term;

            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.term]: [existingTermWithAudio],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            languageCode: languageCodeForTextTranslation,
                            // reused
                            audioItemId: existingAudioItem.id,
                        }),
                    // we check the error in detail in the unit test of `Term.addAudio`
                });
            });
        });
    });
});
