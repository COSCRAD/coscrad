import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { TermModule } from '../../../../../app/domain-modules/term.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CannotRegisterPromptInExistingLanguageError } from '../../../../../domain/common/entities/errors';
import { ID_MANAGER_TOKEN } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { CannotPromptFromExistingPromptTerm } from '../../errors';
import { buildTestTerm } from '../../test-data/build-test-term';
import { RegisterPromptForExistingTerm } from './register-prompt-for-existing-term.command';

const commandType = 'REGISTER_PROMPT_FOR_EXISTING_TERM';

const termId = buildDummyUuid(4);

const existingTermLanguageCode = LanguageCode.Chilcotin;

const existingTerm = buildTestTerm({
    aggregateCompositeIdentifier: { id: termId },
    isPromptTerm: false,
    text: buildMultilingualTextWithSingleItem(
        'existing text in Chilcotin',
        existingTermLanguageCode
    ),
});

const validFsa = {
    type: commandType,
    payload: buildTestInstance(RegisterPromptForExistingTerm, {
        aggregateCompositeIdentifier: { id: termId },
    }),
};

const existingPromptTerm = buildTestTerm({
    isPromptTerm: true,
    text: buildMultilingualTextWithSingleItem('existing text in english', LanguageCode.English),
    aggregateCompositeIdentifier: {
        id: termId,
    },
});

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                TermModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testRepositoryProvider = new TestRepositoryProvider(
            app.get(ArangoDatabaseProvider),
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        app.get(ArangoDatabaseProvider).close();

        app.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .create(existingTerm);
                },
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: RegisterPromptForExistingTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.term)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(Term);

                    const updatedTerm = searchResult as Term;

                    expect(updatedTerm.isPromptTerm).toBe(true);

                    expect(updatedTerm.text.getOriginalTextItem().text).toBe(validFsa.payload.text);

                    expect(
                        updatedTerm.text.has(existingTerm.text.getOriginalTextItem().languageCode)
                    ).toBe(true);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the target term does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await Promise.resolve();
                    },
                    buildCommandFSA: () => validFsa,
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

        describe(`when the existing term is a prompt term`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(AggregateType.term)
                            .create(existingPromptTerm);
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotPromptFromExistingPromptTerm(
                                    validFsa.payload.aggregateCompositeIdentifier.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the language code of the prompt is the same as the language code for the existing text`, () => {
            it(`should fail with the expected error`, async () => {
                const existingText = buildMultilingualTextWithSingleItem(
                    'existing text in English for orinary (non-prompt) term',
                    LanguageCode.English
                );

                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.forResource(AggregateType.term).create(
                            buildTestTerm({
                                aggregateCompositeIdentifier: { id: termId },
                                isPromptTerm: false,
                                text: existingText,
                            })
                        );
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotRegisterPromptInExistingLanguageError(
                                    LanguageCode.English,
                                    validFsa.payload.text
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
