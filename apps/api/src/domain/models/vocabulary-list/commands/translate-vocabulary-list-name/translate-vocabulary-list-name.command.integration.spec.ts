import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { DuplicateLanguageInMultilingualTextError } from '../../../audio-visual/audio-item/errors/duplicate-language-in-multilingual-text.error';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { VocabularyListCreated } from '../create-vocabulary-list';
import { TranslateVocabularyListName } from './translate-vocabulary-list-name.command';

const commandType = 'TRANSLATE_VOCABULARY_LIST_NAME';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const eventHistoryForExistingList = new TestEventStream().andThen<VocabularyListCreated>({
    type: 'VOCABULARY_LIST_CREATED',
    payload: {
        languageCodeForName: originalLanguageCode,
    },
});

const vocabularyListId = buildDummyUuid(1);

const existingVocabularyList = VocabularyList.fromEventHistory(
    eventHistoryForExistingList.as({
        type: AggregateType.vocabularyList,
        id: vocabularyListId,
    }),
    vocabularyListId
) as VocabularyList;

const englishName = 'vocabulary list name translated to English';

const validPayload: TranslateVocabularyListName = {
    aggregateCompositeIdentifier: {
        type: AggregateType.vocabularyList,
        id: existingVocabularyList.id,
    },
    languageCode: translationLanguageCode,
    text: englishName,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<TranslateVocabularyListName>> =>
    validCommandFSA;

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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.vocabularyList]: [existingVocabularyList],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: vocabularyListId },
                }: TranslateVocabularyListName) => {
                    const vocabularyListSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchById(vocabularyListId);

                    expect(vocabularyListSearchResult).not.toBe(NotFound);

                    const vocabularyList = vocabularyListSearchResult as VocabularyList;

                    const englishVocabularyListNameTranslation = vocabularyList.name.getTranslation(
                        LanguageCode.English
                    );

                    expect(
                        (englishVocabularyListNameTranslation as MultilingualTextItem).text
                    ).toBe(englishName);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the vocabulary list name already has a translation in the target language', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validCommandFSA, {
                            payload: {
                                // this is the language code on the creation event
                                languageCode: originalLanguageCode,
                            },
                        }),
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new DuplicateLanguageInMultilingualTextError(originalLanguageCode),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the vocabulary list does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    seedInitialState: async () => {
                        // no-op
                        await Promise.resolve();
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError({
                                    type: AggregateType.vocabularyList,
                                    id: validCommandFSA.payload.aggregateCompositeIdentifier.id,
                                }),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the command payload has an invalid type`, () => {
            describe(`when the aggregate type is invalid`, () => {
                Object.values(AggregateType)
                    .filter((aggregateType) => aggregateType !== AggregateType.vocabularyList)
                    .forEach((aggregateType) => {
                        describe(`when the type is: ${aggregateType}`, () => {
                            it(`should fail with the expected errors`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    commandAssertionDependencies,
                                    {
                                        propertyName: 'aggregateCompositeIdentifier',
                                        invalidValue: {
                                            type: aggregateType,
                                            id: buildDummyUuid(567),
                                        },
                                    },
                                    validCommandFSA
                                );
                            });
                        });
                    });
            });

            generateCommandFuzzTestCases(TranslateVocabularyListName).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA()
                            );
                        });
                    });
                }
            );
        });
    });
});
