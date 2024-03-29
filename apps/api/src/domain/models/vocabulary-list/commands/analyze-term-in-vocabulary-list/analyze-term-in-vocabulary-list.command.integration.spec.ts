import { AggregateType, DropboxOrCheckbox, ResourceType } from '@coscrad/api-interfaces';
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
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { VocabularyListFilterProperty } from '../../entities/vocabulary-list-variable.entity';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import {
    CannotOverwriteFilterPropertyValueForVocabularyListEntryError,
    FailedToAnalyzeVocabularyListEntryError,
} from '../../errors';
import { InvalidVocabularyListFilterPropertyValueError } from '../../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListEntryNotFoundError } from '../../errors/vocabulary-list-entry-not-found.error';
import { VocabularyListFilterPropertyNotFoundError } from '../../errors/vocabulary-list-filter-property-not-found.error';
import { VocabularyListEntry } from '../../vocabulary-list-entry.entity';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';

const commandType = 'ANALYZE_TERM_IN_VOCABULARY_LIST';

const existingTerm = getValidAggregateInstanceForTest(AggregateType.term);

const existingEntry = new VocabularyListEntry({
    termId: existingTerm.id,
    variableValues: {},
});

const selectFilterPropertyName = 'aspect';

const allowedValueForSelectFilterProperty = '1';

// TODO check spelling
const checkboxFilterPropertyName = 'usitative';

const valueForCheckboxProperty = false;

const anotherAllowedValueForSelectFilterProperty = '2';

const selectFilterProperty = new VocabularyListFilterProperty({
    name: selectFilterPropertyName,
    type: DropboxOrCheckbox.dropbox,
    validValues: [
        {
            value: allowedValueForSelectFilterProperty,
            display: 'progressive',
        },
        {
            value: anotherAllowedValueForSelectFilterProperty,
            display: 'perfective',
        },
    ],
});

const checkboxFilterProperty = new VocabularyListFilterProperty({
    name: checkboxFilterPropertyName,
    type: DropboxOrCheckbox.checkbox,
    validValues: [
        {
            value: true,
            display: 'usually',
        },
        {
            value: false,
            display: 'standard form',
        },
    ],
});

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        published: false,
        entries: [existingEntry],
        variables: [selectFilterProperty, checkboxFilterProperty],
    }
);

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AnalyzeTermInVocabularyList>;

const dummyFsaWithEmptyPropertyDefinitions = {
    ...dummyFsa,
    payload: {
        ...dummyFsa.payload,
        /**
         * `clonePlainObjectWithOverrides` will interpret an object-valued
         * override prop as a request to override only the specified keys,
         * leaving other keys. This causes troubles when we want to completely override
         * the object, which really only happens when we model with dynamic keys.
         *
         * While this is a con for using dynamic keys, the latter present the
         * path of least resistance for the current, critical feature.
         */
        propertyValues: {},
    },
};

const validFsa = {
    ...clonePlainObjectWithOverrides(dummyFsaWithEmptyPropertyDefinitions, {
        payload: {
            aggregateCompositeIdentifier: existingVocabularyList.getCompositeIdentifier(),
            termId: existingTerm.id,
            propertyValues: {
                [selectFilterPropertyName]: allowedValueForSelectFilterProperty,
            },
        },
    }),
};

const fsaFactory = new DummyCommandFsaFactory(() => validFsa);

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

    describe('when the command is valid', () => {
        describe(`when analyzing a term with respect to a select filter property`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA: () => validFsa,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.vocabularyList]: [existingVocabularyList],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkStateOnSuccess: async () => {
                        const searchResult = await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .fetchById(existingVocabularyList.id);

                        expect(searchResult).toBeInstanceOf(VocabularyList);

                        const updatedVocabularyList = searchResult as VocabularyList;

                        const updatedEntry = updatedVocabularyList.getEntryForTerm(
                            existingTerm.id
                        ) as VocabularyListEntry;

                        expect(
                            updatedEntry.doesMatch(
                                selectFilterPropertyName,
                                allowedValueForSelectFilterProperty
                            )
                        ).toBe(true);

                        // TODO assert that the command is persisted
                    },
                });
            });
        });

        describe(`when analyzing a term with respect to a checkbox filter property`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildValidCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            propertyValues: {
                                [checkboxFilterPropertyName]: valueForCheckboxProperty,
                                [selectFilterPropertyName]: allowedValueForSelectFilterProperty,
                            },
                        }),
                });
            });
        });

        describe(`when analyzing a term with respect to multiple properties at once`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildValidCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            propertyValues: {
                                [checkboxFilterPropertyName]: valueForCheckboxProperty,
                            },
                        }),
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the vocabulary list does not exist`, () => {
            it(`should return the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () => fsaFactory.build(undefined, {}),
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

        describe(`when there is no entry for the given term`, () => {
            const missingTermId = buildDummyUuid(689);

            it(`should return the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [ResourceType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            termId: missingTermId,
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new VocabularyListEntryNotFoundError(
                                    missingTermId,
                                    existingVocabularyList.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when there is no registered filter property with the given name`, () => {
            const missingPropertyName = 'bogus-prop';

            it(`should return the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [ResourceType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            propertyValues: {
                                [missingPropertyName]: allowedValueForSelectFilterProperty,
                            },
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new VocabularyListFilterPropertyNotFoundError(
                                    missingPropertyName,
                                    existingVocabularyList.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the provided value is not one of the allowed values for the given filter property`, () => {
            const invalidValueForFilterProperty = 'boogus-value';

            it(`should return the exptected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [ResourceType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            propertyValues: {
                                [selectFilterPropertyName]: invalidValueForFilterProperty,
                            },
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidVocabularyListFilterPropertyValueError(
                                    selectFilterPropertyName,
                                    invalidValueForFilterProperty,
                                    existingVocabularyList.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the term has already been analyzed (i.e., already has a value) for this filter property`, () => {
            /**
             * Note that we may allow updating the value for an entry's property
             * later, but for now it is not an intended use case.
             */
            it(`should return the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [ResourceType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );

                        // Analyze the term once with a different property value
                        await commandHandlerService.execute(
                            fsaFactory.build(undefined, {
                                propertyValues: {
                                    [selectFilterPropertyName]:
                                        anotherAllowedValueForSelectFilterProperty,
                                },
                            }),
                            // Note that we have to be explicit here since we are doing this in `seedInitialState`
                            {
                                userId: dummySystemUserId,
                            }
                        );
                    },
                    // attempt to analyze a second time
                    buildCommandFSA: () => fsaFactory.build(undefined, {}),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new FailedToAnalyzeVocabularyListEntryError(
                                    existingTerm.id,
                                    existingVocabularyList.id,
                                    [
                                        new CannotOverwriteFilterPropertyValueForVocabularyListEntryError(
                                            selectFilterPropertyName,
                                            allowedValueForSelectFilterProperty,
                                            anotherAllowedValueForSelectFilterProperty
                                        ),
                                    ]
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
