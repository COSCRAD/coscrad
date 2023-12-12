import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { CannotElicitTermWithoutPromptError, PromptLanguageMustBeUniqueError } from '../../errors';
import { buildTestTerm } from '../../test-data/build-test-term';
import { ELICIT_TERM_FROM_PROMPT, TERM_ELICITED_FROM_PROMPT } from './constants';
import { ElicitTermFromPrompt } from './elicit-term-from-prompt.command';

const commandType = ElicitTermFromPrompt;
const originalLanguageCode = LanguageCode.English;

const existingTerm = buildTestTerm({
    aggregateCompositeIdentifier: {
        id: buildDummyUuid(123),
    },
    isPromptTerm: true,
    text: buildMultilingualTextWithSingleItem(`existing text in english`, originalLanguageCode),
});

const buildValidCommandFSA = () => validFsa;

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.term]: [existingTerm],
}).fetchFullSnapshotInLegacyFormat();

const dummyFsa = buildTestCommandFsaMap().get(
    ELICIT_TERM_FROM_PROMPT
) as CommandFSA<ElicitTermFromPrompt>;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: existingTerm.getCompositeIdentifier(),
    },
});

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
                initialState: validInitialState,
                buildValidCommandFSA: () => validFsa,
                checkStateOnSuccess: async () => {
                    const searchResult = await testRepositoryProvider
                        .forResource<Term>(ResourceType.term)
                        .fetchById(existingTerm.id);

                    expect(searchResult).not.toBeInstanceOf(Error);

                    expect(searchResult).not.toBe(NotFound);

                    const updatedTerm = searchResult as Term;

                    const newTextItem = updatedTerm.text.getTranslation(
                        validFsa.payload.languageCode
                    );

                    const textForNewItem = (newTextItem as MultilingualTextItem).text;

                    expect(textForNewItem).toEqual(validFsa.payload.text);

                    assertEventRecordPersisted(
                        updatedTerm,
                        TERM_ELICITED_FROM_PROMPT,
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the term does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // empty database to start => there is no existing term
                        await Promise.resolve();
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

        describe(`when the existing term is not a prompt term`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        const initialState = new DeluxeInMemoryStore({
                            [AggregateType.term]: [
                                buildTestTerm({
                                    aggregateCompositeIdentifier: {
                                        id: existingTerm.id,
                                    },
                                    isPromptTerm: false,
                                    text: buildMultilingualTextWithSingleItem(
                                        'I am eating more cookies.',
                                        LanguageCode.Chinook
                                    ),
                                }),
                            ],
                        }).fetchFullSnapshotInLegacyFormat();

                        await testRepositoryProvider.addFullSnapshot(initialState);
                    },
                    buildCommandFSA: () => validFsa,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotElicitTermWithoutPromptError(
                                    validFsa.payload.aggregateCompositeIdentifier.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the prompt and elicited term are both in the same langauge`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        const initialState = new DeluxeInMemoryStore({
                            [AggregateType.term]: [existingTerm],
                        }).fetchFullSnapshotInLegacyFormat();

                        await testRepositoryProvider.addFullSnapshot(initialState);
                    },
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(validFsa, {
                            payload: {
                                // same as prompt
                                languageCode: LanguageCode.English,
                            },
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new PromptLanguageMustBeUniqueError(
                                    validFsa.payload.aggregateCompositeIdentifier.id,
                                    LanguageCode.English
                                ),
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

                generateCommandFuzzTestCases(ElicitTermFromPrompt).forEach(
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
