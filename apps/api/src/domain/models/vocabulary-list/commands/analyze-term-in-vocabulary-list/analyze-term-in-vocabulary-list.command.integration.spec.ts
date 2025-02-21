import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
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
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { TermCreated, TermTranslated } from '../../../term/commands';
import { VocabularyList } from '../../entities/vocabulary-list.entity';
import {
    CannotOverwriteFilterPropertyValueForVocabularyListEntryError,
    FailedToAnalyzeVocabularyListEntryError,
} from '../../errors';
import { InvalidVocabularyListFilterPropertyValueError } from '../../errors/invalid-vocabulary-list-filter-property-value.error';
import { VocabularyListEntryNotFoundError } from '../../errors/vocabulary-list-entry-not-found.error';
import { VocabularyListFilterPropertyNotFoundError } from '../../errors/vocabulary-list-filter-property-not-found.error';
import { VocabularyListEntry } from '../../vocabulary-list-entry.entity';
import { TermAddedToVocabularyList } from '../add-term-to-vocabulary-list';
import { VocabularyListCreated } from '../create-vocabulary-list';
import {
    FilterPropertyType,
    VocabularyListFilterPropertyRegistered,
} from '../register-vocabulary-list-filter-property';
import { AnalyzeTermInVocabularyList } from './analyze-term-in-vocabulary-list.command';

const commandType = 'ANALYZE_TERM_IN_VOCABULARY_LIST';

const vocabularyListId = buildDummyUuid(1);

const termId = buildDummyUuid(123);

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

const selectFilterPropertyName = 'aspect';

const allowedValueForSelectFilterProperty = '1';

// TODO check spelling
const checkboxFilterPropertyName = 'usitative';

const valueForCheckboxProperty = false;

const anotherAllowedValueForSelectFilterProperty = '2';

/**
 * TODO Consider adding a big warning with clone that the event history will not
 * be consistent.
 */
const eventHistoryForExistingVocabularyList = new TestEventStream()
    .andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
    })
    .andThen<TermAddedToVocabularyList>({
        type: 'TERM_ADDED_TO_VOCABULARY_LIST',
        payload: {
            termId,
        },
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            name: selectFilterPropertyName,
            type: FilterPropertyType.selection,
            allowedValuesAndLabels: [
                {
                    value: allowedValueForSelectFilterProperty,
                    label: 'progressive',
                },
                {
                    value: anotherAllowedValueForSelectFilterProperty,
                    label: 'perfective',
                },
            ],
        },
    })
    .andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            name: checkboxFilterPropertyName,
            type: FilterPropertyType.checkbox,
            // can we do away with `ValueAndDisplayNow`?
            allowedValuesAndLabels: [
                {
                    value: true,
                    label: 'usually',
                },
                {
                    value: false,
                    label: 'standard form',
                },
            ],
        },
    })
    .as({
        type: AggregateType.vocabularyList,
        id: vocabularyListId,
    });

const existingVocabularyList = VocabularyList.fromEventHistory(
    eventHistoryForExistingVocabularyList,
    vocabularyListId
) as VocabularyList;

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
            termId,
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
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .create(existingVocabularyList);

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
                    },
                    checkStateOnSuccess: async () => {
                        const searchResult = await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .fetchById(existingVocabularyList.id);

                        expect(searchResult).toBeInstanceOf(VocabularyList);

                        const updatedVocabularyList = searchResult as VocabularyList;

                        const updatedEntry = updatedVocabularyList.getEntryForTerm(
                            termId
                        ) as VocabularyListEntry;

                        expect(
                            updatedEntry.doesMatch(
                                selectFilterPropertyName,
                                allowedValueForSelectFilterProperty
                            )
                        ).toBe(true);
                    },
                });
            });
        });

        describe(`when analyzing a term with respect to a checkbox filter property`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .create(existingVocabularyList);

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
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

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
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
                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
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

        describe(`when there is no term for the given entry`, () => {
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

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
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

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);
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

                        await testRepositoryProvider
                            .getEventRepository()
                            .appendEvents(eventHistoryForTerm);

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
                                    termId,
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
