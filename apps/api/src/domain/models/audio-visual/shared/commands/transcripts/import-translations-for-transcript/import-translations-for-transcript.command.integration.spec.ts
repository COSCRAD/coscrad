import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import assertErrorAsExpected from '../../../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../../../test-data/commands';
import { TestEventStream } from '../../../../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../../common/build-multilingual-text-with-single-item';
import InvariantValidationError from '../../../../../../domainModelValidators/errors/InvariantValidationError';
import { IIdManager } from '../../../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../../../shared/common-command-errors/CommandExecutionError';
import InvalidCommandPayloadTypeError from '../../../../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import { AudioItemCreated } from '../../../../audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioVisualCompositeIdentifier } from '../../../../audio-item/entities/audio-item-composite-identifier';
import { AudioItem } from '../../../../audio-item/entities/audio-item.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { Transcript } from '../../../entities/transcript.entity';
import { NoTranslationsProvidedError } from '../../../transcript-errors';
import { LineItemAddedToTranscript } from '../add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../add-participant-to-transcript/participant-added-to-transcript.event';
import { IMPORT_TRANSLATIONS_FOR_TRANSCRIPT } from '../constants';
import { TranscriptCreated } from '../create-transcript/transcript-created.event';
import {
    ImportTranslationsForTranscript,
    TranslationItem,
} from './import-translations-for-transcript.command';

const commandType = IMPORT_TRANSLATIONS_FOR_TRANSCRIPT;

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    const targetInPointMilliseconds = 123.45;

    const mediaItemLength = 10 * targetInPointMilliseconds;

    const existingText = 'original text';

    const existingLanguageCode = LanguageCode.Chilcotin;

    const targetSpeakerInitials = 'JB';

    const lineItemToTranslate: TranscriptItem = new TranscriptItem({
        inPointMilliseconds: targetInPointMilliseconds,
        outPointMilliseconds:
            targetInPointMilliseconds + (mediaItemLength - targetInPointMilliseconds) / 2.0,
        text: buildMultilingualTextWithSingleItem(existingText, existingLanguageCode),
        speakerInitials: targetSpeakerInitials,
    });

    const existingTranscript = new Transcript({
        participants: [targetSpeakerInitials, 'BS', 'AP', 'GH'].map((initials) => ({
            initials,
            name: `name of participant with initials: ${initials}`,
        })),
        items: [lineItemToTranslate],
    });

    const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
        payload: {
            lengthMilliseconds: mediaItemLength,
        },
    });

    const transriptCreated = audioItemCreated.andThen<TranscriptCreated>({
        type: 'TRANSCRIPT_CREATED',
    });

    const lineItemAdded = transriptCreated
        .andThen<ParticipantAddedToTranscript>({
            type: 'PARTICIPANT_ADDED_TO_TRANSCRIPT',
            payload: {
                initials: targetSpeakerInitials,
            },
        })
        .andThen<LineItemAddedToTranscript>({
            type: 'LINE_ITEM_ADDED_TO_TRANSCRIPT',
            payload: {
                speakerInitials: targetSpeakerInitials,
                languageCode: existingLanguageCode,
                inPointMilliseconds: lineItemToTranslate.inPointMilliseconds,
                outPointMilliseconds: lineItemToTranslate.outPointMilliseconds,
            },
        });

    const audioItemId = buildDummyUuid(1);

    const audioCompositeId = {
        type: AggregateType.audioItem,
        id: audioItemId,
    };

    const existingAudioItem = AudioItem.fromEventHistory(
        lineItemAdded.as(audioCompositeId),
        audioItemId
    ) as AudioItem;

    getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
        lengthMilliseconds: mediaItemLength,
        transcript: existingTranscript,
    });

    const translationText = 'this is the translation';

    const translationLanguageCode = LanguageCode.English;

    const translationItem = {
        translation: translationText,
        languageCode: translationLanguageCode,
        inPointMilliseconds: targetInPointMilliseconds,
    };

    const dummyFsa = buildTestCommandFsaMap().get(
        commandType
    ) as CommandFSA<ImportTranslationsForTranscript>;

    const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier:
                existingAudioItem.getCompositeIdentifier() as AudioVisualCompositeIdentifier,
            translationItems: [translationItem],
        },
    });

    const fsaFactory = new DummyCommandFsaFactory(() => validFsa);

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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe(`when the command is valid`, () => {
        describe(`when importing translations to an audio transcript`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [existingAudioItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildValidCommandFSA: () => validFsa,
                });
            });
        });
    });

    // note that we only test video for the happy path, as other test cases are unrelated to the resource type
    describe(`when the command is invalid`, () => {
        describe(`when the audiovisual item does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            // empty
                            new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validFsa,
                });
            });
        });

        describe(`when there is no existing transcript`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [
                                    AudioItem.fromEventHistory(
                                        audioItemCreated.as(audioCompositeId),
                                        audioItemId
                                    ) as AudioItem,
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validFsa,
                });
            });
        });

        describe(`when the existing transcript has no line items`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [
                                    AudioItem.fromEventHistory(
                                        transriptCreated.as(audioCompositeId),
                                        audioItemId
                                    ) as AudioItem,
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => validFsa,
                });
            });
        });

        describe(`when there is no existing line item with the given in point`, () => {
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
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            translationItems: [
                                clonePlainObjectWithOverrides(
                                    validFsa.payload.translationItems[0],
                                    {
                                        inPointMilliseconds: targetInPointMilliseconds * 1.01,
                                    }
                                ),
                            ],
                        }),
                });
            });
        });

        describe(`when the original is in the target translation language`, () => {
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
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            translationItems: [
                                clonePlainObjectWithOverrides(
                                    validFsa.payload.translationItems[0],
                                    {
                                        languageCode: existingLanguageCode,
                                    }
                                ),
                            ],
                        }),
                });
            });
        });

        // TODO When there is already a translation in the target langauge
        describe(`when the original is in the target translation language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.audioItem]: [
                                    existingAudioItem.importTranslationsForTranscript(
                                        [translationItem].map(
                                            // TODO remove this asymmetry
                                            ({
                                                translation: text,
                                                languageCode,
                                                inPointMilliseconds,
                                            }) => ({
                                                text,
                                                languageCode,
                                                inPointMilliseconds,
                                            })
                                        )
                                    ) as unknown as AudioItem,
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            translationItems: [
                                clonePlainObjectWithOverrides(
                                    validFsa.payload.translationItems[0],
                                    {
                                        languageCode: existingLanguageCode,
                                    }
                                ),
                            ],
                        }),
                });
            });
        });

        // TODO when the translation items themselves are inconsistent
        describe(`when the translation items are inconsistent`, () => {
            describe(`when the translations have overlapping timestamps`, () => {
                const repeatedInPoint = existingAudioItem.lengthMilliseconds * 0.1;

                const translationItemsWithOverlappingInpoints: TranslationItem[] = [
                    {
                        inPointMilliseconds: repeatedInPoint,
                        translation: 'this is the first translation',
                        languageCode: LanguageCode.English,
                    },
                    {
                        inPointMilliseconds: repeatedInPoint,
                        translation: 'this is the second translation',
                        languageCode: LanguageCode.English,
                    },
                ];

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
                        buildCommandFSA: () =>
                            fsaFactory.build(undefined, {
                                translationItems: translationItemsWithOverlappingInpoints,
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvariantValidationError(
                                        existingAudioItem.getCompositeIdentifier(),
                                        []
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when no translations ([]) are provided`, () => {
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
                        buildCommandFSA: () =>
                            fsaFactory.build(undefined, {
                                translationItems: [],
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                //  TODO make this a type error
                                // new InvalidCommandPayloadTypeError(commandType, [])
                                new CommandExecutionError([new NoTranslationsProvidedError()])
                            );
                        },
                    });
                });
            });

            describe(`when one of the translations has an invalid text`, () => {
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
                        buildCommandFSA: () =>
                            fsaFactory.build(undefined, {
                                translationItems: [
                                    {
                                        ...translationItem,
                                        translation: '   ',
                                    },
                                ],
                            }),
                        checkError: (error) => {
                            const expectedErrorWithoutInnerErrors =
                                new InvalidCommandPayloadTypeError(commandType, []);

                            // We just want to check that the command type is referenced in a type error without being too specific about inner errors
                            const invalidMessages = [error.toString()].filter(
                                (msg) => !msg.includes(expectedErrorWithoutInnerErrors.toString())
                            );

                            expect(invalidMessages).toEqual([]);
                        },
                    });
                });
            });

            // TODO Add a separate fuzz test \ payload aggregate type teset
        });
    });
});
