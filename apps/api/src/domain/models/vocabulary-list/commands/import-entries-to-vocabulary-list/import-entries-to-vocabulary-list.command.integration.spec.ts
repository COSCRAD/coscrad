import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { TermCreated, TermTranslated } from '../../../term/commands';
import { Term } from '../../../term/entities/term.entity';
import {
    VocabularyList,
    VocabularyListEntryImportItem,
} from '../../entities/vocabulary-list.entity';
import { VocabularyListEntry } from '../../vocabulary-list-entry.entity';
import { VocabularyListCreated } from '../create-vocabulary-list';
import {
    FilterPropertyType,
    VocabularyListFilterPropertyRegistered,
} from '../register-vocabulary-list-filter-property';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

const commandType = 'IMPORT_ENTRIES_TO_VOCABULARY_LIST';

const termsToImport = [117, 118, 119].map((sequentialId) => {
    const termId = buildDummyUuid(sequentialId);

    const eventHistoryForTerm = new TestEventStream()
        .andThen<TermCreated>({
            type: 'TERM_CREATED',
        })
        .andThen<TermTranslated>({
            type: 'TERM_TRANSLATED',
        })
        .as({
            type: AggregateType.term,
            id: termId,
        });

    const result = Term.fromEventHistory(eventHistoryForTerm, termId);

    if (isInternalError(result)) {
        throw new InternalError(`Failed to event source test data`, [result]);
    }

    if (isNotFound(result)) {
        throw new InternalError(`Failed to event source test data`, [
            new AggregateNotFoundError({
                type: AggregateType.term,
                id: termId,
            }),
        ]);
    }

    return result;
});

const allowedValuesForPersonProperty = ['11', '21', '31'];

const entries: VocabularyListEntryImportItem[] = allowedValuesForPersonProperty.map(
    (value, index) => ({
        termId: termsToImport[index].id,
        propertyValues: {
            person: value,
            positive: true,
        },
    })
);

const eventHistoryForVocabularyList = new TestEventStream()
    .andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            name: 'person',
            type: FilterPropertyType.selection,
            allowedValuesAndLabels: allowedValuesForPersonProperty.map((value) => ({
                value,
                label: `label for ${value}`,
            })),
        },
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            name: 'positive',
            type: FilterPropertyType.checkbox,
            allowedValuesAndLabels: [
                {
                    value: true,
                    label: 'positive',
                },
                {
                    value: false,
                    label: 'negative',
                },
            ],
        },
    });

const vocabularyListId = buildDummyUuid(1);

const existingVocabularyList = VocabularyList.fromEventHistory(
    eventHistoryForVocabularyList.as({
        type: AggregateType.vocabularyList,
        id: vocabularyListId,
    }),
    vocabularyListId
) as VocabularyList;

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<ImportEntriesToVocabularyList>;

const aggregateCompositeIdentifier = existingVocabularyList.getCompositeIdentifier();

const commandFsaFactory = new DummyCommandFsaFactory<ImportEntriesToVocabularyList>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            entries,
        },
    })
);

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

    const seedValidInitialState = async () => {
        await testRepositoryProvider
            .forResource(ResourceType.vocabularyList)
            .create(existingVocabularyList);

        await testRepositoryProvider.forResource(AggregateType.term).createMany(termsToImport);
    };

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => commandFsaFactory.build(),
                seedInitialState: seedValidInitialState,
                checkStateOnSuccess: async () => {
                    const vocabularyListSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchById(aggregateCompositeIdentifier.id);

                    expect(vocabularyListSearchResult).toBeInstanceOf(VocabularyList);

                    const updatedVocabularyList = vocabularyListSearchResult as VocabularyList;

                    const missingEntries = entries.filter(({ termId, propertyValues }) => {
                        if (!updatedVocabularyList.hasEntryForTerm(termId)) return true;

                        const entryForTerm = updatedVocabularyList.getEntryForTerm(
                            termId
                        ) as VocabularyListEntry;

                        return !entryForTerm.doesMatchAll(propertyValues);
                    });

                    expect(missingEntries).toEqual([]);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when one of the terms is missing`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .create(existingVocabularyList);

                        await testRepositoryProvider
                            .forResource(ResourceType.term)
                            // we skip adding the 0th term to the database
                            .createMany(termsToImport.slice(1))
                            .catch((e) => {
                                throw new InternalError(`${e}`);
                            });
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,

                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingVocabularyList.getCompositeIdentifier(),
                                    [termsToImport[0].getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when one of the filter properties has not been registered`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            entries: entries.slice(1).concat({
                                termId: entries[0].termId,
                                propertyValues: {
                                    ...entries[0].propertyValues,
                                    'bogus-prop': '55',
                                },
                            }),
                        }),
                });
            });
        });

        describe(`when one of the filter properties has a value that is not allowed`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            entries: entries.slice(1).concat({
                                termId: entries[0].termId,
                                propertyValues: {
                                    ...entries[0].propertyValues,
                                    person: '55',
                                },
                            }),
                        }),
                });
            });
        });

        /**
         * This is covered by the fuzz test, but given that it is easy
         * to mess up the `isOptional` \ `isArray` metadata, we decided to
         * have an explicit test case here.
         */
        describe(`when no entries are provided`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: seedValidInitialState,
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            entries: [],
                        }),
                });
            });
        });
    });
});
