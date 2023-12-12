import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { buildMultilingualTextFromBilingualText } from '../../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../../common/entities/errors';
import { MultilingualTextItem } from '../../../../common/entities/multilingual-text';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { buildTestTerm } from '../../test-data/build-test-term';
import { TranslateTerm } from './translate-term.command';

const commandType = 'TRANSLATE_TERM';

const originalLanguageCode = LanguageCode.Haida;

const existingTerm = buildTestTerm({
    aggregateCompositeIdentifier: {
        id: buildDummyUuid(444),
    },
    isPromptTerm: false,
    // It's important that there is no English translation of the existing term yet
    text: buildMultilingualTextWithSingleItem(`existing text in Haida`, originalLanguageCode),
});

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<TranslateTerm>;

// It would be nice to abstract this into the helper `buildTestCommandFsa(`TRANSLATE_TERM`,myOverrides)`
const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: {
            id: existingTerm.id,
        },
    },
});

const buildValidCommandFSA = () => validFsa;

const commandFsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.term]: [existingTerm],
}).fetchFullSnapshotInLegacyFormat();

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
        it(`should succeed with the correct database updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(validInitialState);
                },
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    translation,
                    languageCode,
                    aggregateCompositeIdentifier: { id },
                }: TranslateTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.term)
                        .fetchById(id);

                    expect(searchResult).not.toBe(NotFound);

                    expect(searchResult).not.toBeInstanceOf(Error);

                    const term = searchResult as Term;

                    const foundTranslation = term.text.getTranslation(languageCode);

                    expect(foundTranslation).not.toBe(NotFound);

                    const actualTranslation = foundTranslation as MultilingualTextItem;

                    expect(actualTranslation.text).toBe(translation);

                    assertEventRecordPersisted(term, 'TERM_TRANSLATED', dummySystemUserId);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the translation language is the same as the original text`, () => {
            it(`should fail with the expected error`, async () => {
                const translation = 'duplicated translation';

                const languageCode = existingTerm.text.getOriginalTextItem().languageCode;

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(validInitialState);
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            translation,
                            languageCode,
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(
                                    new MultilingualTextItem({
                                        text: translation,
                                        languageCode,
                                        role: MultilingualTextItemRole.freeTranslation,
                                    }),
                                    existingTerm.text
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the translation language is the same as another translation`, () => {
            it(`should fail with the expected error`, async () => {
                const translationLanguageCode = LanguageCode.English;

                const existingTermWithTranslation = buildTestTerm({
                    aggregateCompositeIdentifier: {
                        id: existingTerm.id,
                    },
                    isPromptTerm: false,
                    text: buildMultilingualTextFromBilingualText(
                        {
                            text: 'original text of existing term',
                            languageCode: originalLanguageCode,
                        },
                        {
                            text: 'text for translation',
                            languageCode: translationLanguageCode,
                        }
                    ),
                });

                existingTerm.translate(`existing translation`, translationLanguageCode) as Term;

                const translation = 'duplicated translation';

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.term]: [existingTermWithTranslation],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            translation,
                            languageCode: translationLanguageCode,
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddDuplicateTranslationError(
                                    new MultilingualTextItem({
                                        text: translation,
                                        languageCode: translationLanguageCode,
                                        role: MultilingualTextItemRole.freeTranslation,
                                    }),
                                    existingTermWithTranslation.text
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the term does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // nothing to seed
                        Promise.resolve();
                    },
                    buildCommandFSA: buildValidCommandFSA,
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

        describe(`when the payload has an invalid type`, () => {
            describe(`when the aggregate type is not term`, () => {
                Object.values(AggregateType)
                    .filter((aggregateType) => aggregateType !== AggregateType.term)
                    .forEach((invalidType) => {
                        describe(`when aggregateType is ${invalidType}`, () => {
                            it(`should fail with a type error`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    commandAssertionDependencies,
                                    {
                                        propertyName: `aggregateCompositeIdentifier`,
                                        invalidValue: {
                                            type: invalidType,
                                            id: existingTerm.id,
                                        },
                                    },
                                    validFsa
                                );
                            });
                        });
                    });

                generateCommandFuzzTestCases(TranslateTerm).forEach(
                    ({ description, propertyName, invalidValue }) => {
                        describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
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
});
