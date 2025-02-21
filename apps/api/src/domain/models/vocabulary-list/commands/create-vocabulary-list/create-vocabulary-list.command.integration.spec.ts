import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualTextItem } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import UuidNotGeneratedInternallyError from '../../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { DuplicateVocabularyListNameError } from '../../errors';
import { VOCABULARY_LIST_CREATED } from './constants';
import { CreateVocabularyList } from './create-vocabulary-list.command';
import { VocabularyListCreated } from './vocabulary-list-created.event';

const commandType = 'CREATE_VOCABULARY_LIST';

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const nameInLanguage = 'VL Name in the Language';

const languageCodeForName = LanguageCode.Haida;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<CreateVocabularyList>;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        name: nameInLanguage,
        languageCodeForName,
    },
});

const commandFsaFactory = new DummyCommandFsaFactory((id: string) =>
    clonePlainObjectWithOverrides(validFsa, {
        payload: {
            aggregateCompositeIdentifier: {
                id,
            },
        },
    })
);

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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: emptyInitialState,
                buildValidCommandFSA: (id) => commandFsaFactory.build(id),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: idOfNewVocabularyList },
                }: CreateVocabularyList) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.vocabularyList)
                        .fetchById(idOfNewVocabularyList);

                    expect(searchResult).toBeInstanceOf(VocabularyList);

                    const vocabularyList = searchResult as VocabularyList;

                    const originalTextItem = vocabularyList.name.getOriginalTextItem();

                    expect(originalTextItem.languageCode).toBe(languageCodeForName);

                    expect(originalTextItem.text).toBe(nameInLanguage);

                    expect(vocabularyList.variables).toEqual([]);

                    expect(vocabularyList.entries).toEqual([]);

                    // The vocabulary list should not be published initially
                    expect(vocabularyList.published).toBe(false);

                    assertEventRecordPersisted(
                        vocabularyList,
                        VOCABULARY_LIST_CREATED,
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already a vocabulary list with the given name`, () => {
            it(`should fail with the expected errors`, async () => {
                const idOfVocabularyListWithSameName = buildDummyUuid(123);

                await assertCreateCommandError(assertionHelperDependencies, {
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [
                                    VocabularyList.fromEventHistory(
                                        new TestEventStream()
                                            .andThen<VocabularyListCreated>({
                                                type: 'VOCABULARY_LIST_CREATED',
                                                payload: {
                                                    name: validFsa.payload.name,
                                                    languageCodeForName:
                                                        validFsa.payload.languageCodeForName,
                                                },
                                            })
                                            .as({
                                                id: idOfVocabularyListWithSameName,
                                            }),
                                        idOfVocabularyListWithSameName
                                    ) as VocabularyList,
                                    getValidAggregateInstanceForTest(AggregateType.vocabularyList),
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id: string) => commandFsaFactory.build(id),
                    checkError: (error, id) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new DuplicateVocabularyListNameError(
                                        {
                                            type: AggregateType.vocabularyList,
                                            id,
                                        },
                                        {
                                            type: AggregateType.vocabularyList,
                                            id: idOfVocabularyListWithSameName,
                                        },
                                        new MultilingualTextItem({
                                            text: nameInLanguage,
                                            languageCode: languageCodeForName,
                                            role: MultilingualTextItemRole.original,
                                        })
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe('when there is already a vocabulary list with the given ID', () => {
            it('should return the expected error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = commandFsaFactory.build(newId);

                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        [AggregateType.vocabularyList]: [
                            VocabularyList.fromEventHistory(
                                new TestEventStream()
                                    .andThen<VocabularyListCreated>({
                                        type: 'VOCABULARY_LIST_CREATED',
                                    })
                                    .as({
                                        id: newId,
                                    }),
                                newId
                            ) as VocabularyList,
                        ],
                    }).fetchFullSnapshotInLegacyFormat()
                );

                const result = await commandHandlerService.execute(validCommandFSA, {
                    userId: dummySystemUserId,
                });

                expect(result).toBeInstanceOf(InternalError);
            });
        });

        describe('when the id has not been generated via our system', () => {
            it('should return the expected error', async () => {
                const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) => commandFsaFactory.build(bogusId),
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    checkError: (error: InternalError) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new UuidNotGeneratedInternallyError(bogusId),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the command payload type is invalid`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.vocabularyList)
                .forEach((invalidAggregateType) => {
                    describe(`when the command has an invalid aggregate type: ${invalidAggregateType}`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertCreateCommandError(assertionHelperDependencies, {
                                systemUserId: dummySystemUserId,
                                initialState: emptyInitialState,
                                buildCommandFSA: (id: string) =>
                                    commandFsaFactory.build(id, {
                                        aggregateCompositeIdentifier: {
                                            type: invalidAggregateType,
                                        },
                                    }),
                                checkError: (error: InternalError) => {
                                    expect(
                                        error.toString().includes(`aggregateCompositeIdentifier`)
                                    ).toBe(true);
                                },
                            });
                        });
                    });
                });

            generateCommandFuzzTestCases(CreateVocabularyList).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                validFsa
                            );
                        });
                    });
                }
            );
        });
    });
});
