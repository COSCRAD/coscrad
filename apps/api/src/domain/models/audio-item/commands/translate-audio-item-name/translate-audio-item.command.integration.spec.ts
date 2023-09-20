import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CannotAddDuplicateTranslationError } from '../../../../../domain/common/entities/errors';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { AudioItem } from '../../entities/audio-item.entity';
import { TranslateAudioItemName } from './translate-audio-item-name.command';

const commandType = 'TRANSLATE_AUDIO_ITEM_NAME';

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    name: new MultilingualText({
        items: [
            new MultilingualTextItem({
                text: 'original name of the audio item',
                role: MultilingualTextItemRole.original,
                languageCode: LanguageCode.Chilcotin,
            }),
        ],
    }),
});

const languageCodeForExistingAudioName = LanguageCode.Chilcotin;

const languageCodeForTranslation = LanguageCode.English;

const englishName = 'audio item name translated to English';

const validPayload: TranslateAudioItemName = {
    aggregateCompositeIdentifier: {
        type: AggregateType.audioItem,
        id: existingAudioItem.id,
    },
    languageCode: languageCodeForTranslation,
    text: englishName,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<TranslateAudioItemName>> => validCommandFSA;

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
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
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.audioItem]: [existingAudioItem],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: audioItemId },
                }: TranslateAudioItemName) => {
                    const audioItemSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.audioItem)
                        .fetchById(audioItemId);

                    expect(audioItemSearchResult).not.toBe(NotFound);

                    const audioItem = audioItemSearchResult as AudioItem;

                    const englishAudioItemNameTranslation = audioItem.name.getTranslation(
                        LanguageCode.English
                    );

                    expect((englishAudioItemNameTranslation as MultilingualTextItem).text).toBe(
                        englishName
                    );

                    expect((englishAudioItemNameTranslation as MultilingualTextItem).role).toBe(
                        MultilingualTextItemRole.freeTranslation
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the audio item with the given ID does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
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

        describe(`when the audio item's name has already been translated into the language`, () => {
            it(`should fail with the expected errors`, async () => {
                const existingAudioItemTranslationInTargetLanguage =
                    existingAudioItem.translateName(
                        'existing translation in the language',
                        languageCodeForTranslation
                    ) as AudioItem;
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [existingAudioItemTranslationInTargetLanguage],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => validCommandFSA,
                    checkError: (error) => {
                        const newItem = new MultilingualTextItem({
                            text: validCommandFSA.payload.text,
                            role: MultilingualTextItemRole.freeTranslation,
                            languageCode: validCommandFSA.payload.languageCode,
                        });

                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(
                                    newItem,
                                    existingAudioItemTranslationInTargetLanguage.name
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the audio item was named in the given language to start with`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [existingAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () =>
                        new DummyCommandFsaFactory(() => validCommandFSA).build(null, {
                            languageCode: languageCodeForExistingAudioName,
                        }),
                    checkError: (error) => {
                        const newItem = new MultilingualTextItem({
                            text: validCommandFSA.payload.text,
                            role: MultilingualTextItemRole.freeTranslation,
                            languageCode: languageCodeForExistingAudioName,
                        });

                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(
                                    newItem,
                                    existingAudioItem.name
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the payload type is invalid`, () => {
            describe(`when aggregateCompositeIdentifier.type is not audioItem`, () => {
                Object.values(AggregateType)
                    .filter((aggregateType) => aggregateType !== AggregateType.audioItem)
                    .forEach((invalidType) => {
                        describe(`when the type is: ${invalidType}`, () => {
                            it(`should fail with the expected error`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    commandAssertionDependencies,
                                    {
                                        propertyName: `aggregateCompositeIdentifier`,
                                        invalidValue: {
                                            type: invalidType,
                                            id: buildDummyUuid(468),
                                        },
                                    },
                                    validCommandFSA
                                );
                            });
                        });
                    });
            });

            generateCommandFuzzTestCases(TranslateAudioItemName).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it(`should fail with the appropriate error`, async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                {
                                    propertyName,
                                    invalidValue,
                                },
                                validCommandFSA
                            );
                        });
                    });
                }
            );
        });
    });
});
