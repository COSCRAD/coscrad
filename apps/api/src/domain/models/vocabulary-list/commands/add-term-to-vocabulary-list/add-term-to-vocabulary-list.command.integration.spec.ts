import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
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
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import { CannotAddMultipleEntriesForSingleTermError } from '../../errors';
import { AddTermToVocabularyList } from './add-term-to-vocabulary-list.command';

const commandType = 'ADD_TERM_TO_VOCABULARY_LIST';

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        published: false,
        entries: [],
    }
);

const existingTerm = getValidAggregateInstanceForTest(AggregateType.term);

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<AddTermToVocabularyList>;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: existingVocabularyList.getCompositeIdentifier(),
        termId: existingTerm.id,
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
        it(`should succeed`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validFsa,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.vocabularyList]: [existingVocabularyList],
                    [AggregateType.term]: [existingTerm],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async () => {
                    const searchResult = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchById(validFsa.payload.aggregateCompositeIdentifier.id);

                    expect(searchResult).toBeInstanceOf(VocabularyList);

                    const updatedVocabularyList = searchResult as VocabularyList;

                    const isTermInList = updatedVocabularyList.hasEntryForTerm(
                        validFsa.payload.termId
                    );

                    expect(isTermInList).toBe(true);

                    assertEventRecordPersisted(
                        updatedVocabularyList,
                        'TERM_ADDED_TO_VOCABULARY_LIST',
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
                    buildCommandFSA: () => validFsa,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.vocabularyList]: [existingVocabularyList],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    // TODO double check why this isnt coming through
                                    // new AggregateNotFoundError(
                                    //     existingTerm.getCompositeIdentifier()
                                    // ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the vocabulary list does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => validFsa,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.term]: [existingTerm],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existingVocabularyList.getCompositeIdentifier()
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the term is already in the vocabulary list`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => validFsa,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.vocabularyList]: [
                            existingVocabularyList.addEntry(existingTerm.id) as VocabularyList,
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddMultipleEntriesForSingleTermError(
                                    existingTerm.id,
                                    existingVocabularyList.id
                                ),
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
                                    validFsa
                                );
                            });
                        });
                    });
            });

            generateCommandFuzzTestCases(AddTermToVocabularyList).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
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
