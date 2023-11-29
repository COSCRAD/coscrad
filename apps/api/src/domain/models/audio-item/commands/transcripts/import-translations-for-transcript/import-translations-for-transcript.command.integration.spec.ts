import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { AudioVisualCompositeIdentifier } from '../../../entities/audio-item-composite-identifier';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { Transcript } from '../../../entities/transcript.entity';
import { IMPORT_TRANSLATIONS_FOR_TRANSCRIPT } from '../constants';
import { ImportTranslationsForTranscript } from './import-translations-for-transcript.command';

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

    const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
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

    // TODO Do these tests for a video item as well
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
                                    existingAudioItem.clone({
                                        transcript: undefined,
                                    }),
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
                                    existingAudioItem.clone({
                                        transcript: existingTranscript.clone({
                                            items: [],
                                        }),
                                    }),
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
                it.todo(`should have a test`);
            });

            describe(`when no translations ([]) are provided`, () => {
                it.todo(`should have a test`);
            });

            describe(`when one of the translations has an invalid text`, () => {
                it.todo(`should have a test`);
            });
        });
    });
});
