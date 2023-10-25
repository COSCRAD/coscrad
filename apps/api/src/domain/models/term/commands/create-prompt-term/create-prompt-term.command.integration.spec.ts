import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualTextItemRole } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateIdAlreadyInUseError from '../../../shared/common-command-errors/AggregateIdAlreadyInUseError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { Term } from '../../entities/term.entity';
import { CREATE_PROMPT_TERM } from './constants';
import { CreatePromptTerm } from './create-prompt-term.command';

const commandType = CREATE_PROMPT_TERM;

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const commandFsa = buildTestCommandFsaMap().get(CREATE_PROMPT_TERM) as CommandFSA<CreatePromptTerm>;

const buildValidCommandFSA = (id: AggregateId) =>
    clonePlainObjectWithOverrides(commandFsa, {
        payload: {
            aggregateCompositeIdentifier: {
                id,
            },
        },
    });

const prompt = commandFsa.payload.text;

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected state updates`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: emptyInitialState,
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreatePromptTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.term)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(Term);

                    const term = searchResult as Term;

                    const termTextItem = term.text.getOriginalTextItem();

                    expect(termTextItem.text).toBe(prompt);

                    expect(termTextItem.role).toBe(MultilingualTextItemRole.original);

                    expect(termTextItem.languageCode).toBe(LanguageCode.English);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already a term with the given ID`, () => {
            it(`should fail with the expected errors`, async () => {
                const usedId = await idManager.generate();

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        term: [
                            getValidAggregateInstanceForTest(AggregateType.term).clone({
                                id: usedId,
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: (_id) => buildValidCommandFSA(usedId),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateIdAlreadyInUseError({
                                        type: AggregateType.term,
                                        id: usedId,
                                    }),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the payload type is invalid`, () => {
            describe(`when the aggregate type is not term`, () => {
                Object.values(AggregateType)
                    .filter((aggregateType) => aggregateType !== AggregateType.term)
                    .forEach((invalidAggregateType) => {
                        describe(`when the invalid aggregate type is: ${invalidAggregateType}`, () => {
                            it(`should fail with the expected errors`, async () => {
                                await assertCommandFailsDueToTypeError(
                                    assertionHelperDependencies,
                                    {
                                        propertyName: 'aggregateCompositeIdentifier',
                                        invalidValue: {
                                            type: invalidAggregateType,
                                            id: commandFsa.payload.aggregateCompositeIdentifier.id,
                                        },
                                    },
                                    commandFsa
                                );
                            });
                        });
                    });
            });

            // Fuzz test
            generateCommandFuzzTestCases(CreatePromptTerm).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA(buildDummyUuid(123))
                            );
                        });
                    });
                }
            );
        });
    });
});
