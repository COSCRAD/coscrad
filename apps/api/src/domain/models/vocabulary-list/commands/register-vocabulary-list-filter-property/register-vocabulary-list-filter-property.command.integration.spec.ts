import { AggregateType, DropboxOrCheckbox } from '@coscrad/api-interfaces';
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
import InvariantValidationError from '../../../../domainModelValidators/errors/InvariantValidationError';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { InvalidValueForCheckboxFilterPropertyError } from '../../entities/invalid-value-for-checkbox-filter-property.error';
import { InvalidValueForSelectFilterPropertyError } from '../../entities/invalid-value-for-select-filter-property.error';
import { VocabularyListFilterProperty } from '../../entities/vocabulary-list-variable.entity';
import {
    CannotHaveTwoFilterPropertiesWithTheSameNameError,
    DuplicateValueForVocabularyListFilterPropertyValueError,
} from '../../errors';
import { DuplicateLabelForVocabularyListFilterPropertyValueError } from '../../errors/duplicate-label-for-vocabulary-list-filter-property-value.error';
import { REGISTER_VOCABULARY_LIST_FILTER_PROPERTY } from './constants';
import { FilterPropertyType, RegisterVocabularyListFilterProperty } from './index';

const commandType = REGISTER_VOCABULARY_LIST_FILTER_PROPERTY;

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        // ensure that there are no filter properties to start with
        variables: [],
    }
);

const dummyFsa = buildTestCommandFsaMap().get(
    REGISTER_VOCABULARY_LIST_FILTER_PROPERTY
) as CommandFSA<RegisterVocabularyListFilterProperty>;

const validFsa = clonePlainObjectWithOverrides(dummyFsa, {
    payload: {
        aggregateCompositeIdentifier: existingVocabularyList.getCompositeIdentifier(),
    },
});

const commandFsaFactory = new DummyCommandFsaFactory(() => validFsa);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.vocabularyList]: [existingVocabularyList],
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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe(`when the command is valid`, () => {
        describe(`when registering a selection filter property`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: validInitialState,
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            type: FilterPropertyType.selection,
                            name: 'possessor',
                            allowedValuesAndLabels: [
                                {
                                    value: '1',
                                    label: 'my',
                                },
                                {
                                    value: '2',
                                    label: 'your',
                                },
                                {
                                    value: '3',
                                    label: 'her',
                                },
                            ],
                        }),
                });
            });
        });

        describe(`when registering a checkbox filter property`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: validInitialState,
                    buildValidCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            type: FilterPropertyType.checkbox,
                            name: 'affirmitive',
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
                        }),
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the vocabulary list does not exist`, () => {
            it.todo(`should fail with the expected errors`);
        });

        describe(`when there is already a filter property with the given name`, () => {
            it(`should fail with the expected errors`, async () => {
                const duplicateFilterPropertyName = 'foobar';

                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [
                                    existingVocabularyList.clone({
                                        variables: [
                                            new VocabularyListFilterProperty({
                                                name: duplicateFilterPropertyName,
                                                type: DropboxOrCheckbox.dropbox,
                                                validValues: [
                                                    {
                                                        value: 'F8',
                                                        display: 'foo',
                                                    },
                                                ],
                                            }),
                                        ],
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            name: duplicateFilterPropertyName,
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotHaveTwoFilterPropertiesWithTheSameNameError(
                                    duplicateFilterPropertyName,
                                    existingVocabularyList.id
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the filter property type is other than selection or checkbox`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.vocabularyList]: [existingVocabularyList],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: () =>
                        commandFsaFactory.build(undefined, {
                            // this is not an allowed filter property type
                            type: 'number',
                        }),
                    checkError: (error) => {
                        // We do it this way so we can see the actual message on failure
                        const invalidMessages = [error.toString()].filter(
                            (message) => !message.includes(`type`)
                        );

                        expect(invalidMessages).toEqual([]);
                    },
                });
            });
        });

        describe(`when the filter property type is selection`, () => {
            describe(`when no allowed values and labels are provided`, () => {
                // `allowedValuesAndLabels=[]` on the payload
                it.todo(`should fail with the expected errors`);
            });

            describe(`when one of the values is a boolean (instead of a string)`, () => {
                const invalidValueAndLabel = {
                    value: false,
                    label: 'oopsy',
                };

                it(`should fail with the expected errors`, async () => {
                    const dummyName = `aspect`;

                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(validInitialState);
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                name: dummyName,
                                type: FilterPropertyType.selection,
                                allowedValuesAndLabels: [
                                    invalidValueAndLabel,
                                    {
                                        value: '1',
                                        label: 'imperfective',
                                    },
                                ],
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvariantValidationError(
                                        existingVocabularyList.getCompositeIdentifier(),
                                        [
                                            new InvalidValueForSelectFilterPropertyError(
                                                {
                                                    value: invalidValueAndLabel.value,
                                                    display: invalidValueAndLabel.label,
                                                },
                                                dummyName
                                            ),
                                        ]
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when a label is repeated`, () => {
                it(`should fail with the expected errors`, async () => {
                    const reusedLabel = 'I';

                    const nameOfPropertyWithReusedLabel = 'person';

                    const dummyValue1 = '1';

                    const dummyValue2 = '11';

                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(validInitialState);
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                name: nameOfPropertyWithReusedLabel,
                                allowedValuesAndLabels: [
                                    {
                                        value: dummyValue1,
                                        label: reusedLabel,
                                    },
                                    {
                                        value: dummyValue2,
                                        label: reusedLabel,
                                    },
                                ],
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvariantValidationError(
                                        existingVocabularyList.getCompositeIdentifier(),
                                        [
                                            new DuplicateLabelForVocabularyListFilterPropertyValueError(
                                                nameOfPropertyWithReusedLabel,
                                                reusedLabel,
                                                dummyValue1
                                            ),
                                            new DuplicateLabelForVocabularyListFilterPropertyValueError(
                                                nameOfPropertyWithReusedLabel,
                                                reusedLabel,
                                                dummyValue2
                                            ),
                                        ]
                                    ),
                                ])
                            );
                        },
                    });
                });
            });

            describe(`when a value is repeated`, () => {
                it(`should fail with the expected errors`, async () => {
                    const reusedValue = '1';

                    const nameOfPropertyWithReusedValue = 'person';

                    const dummyLabel1 = 'I';

                    const dummyLabel2 = '11';

                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(validInitialState);
                        },
                        buildCommandFSA: () =>
                            commandFsaFactory.build(undefined, {
                                name: nameOfPropertyWithReusedValue,
                                allowedValuesAndLabels: [
                                    {
                                        value: reusedValue,
                                        label: dummyLabel1,
                                    },
                                    {
                                        value: reusedValue,
                                        label: dummyLabel2,
                                    },
                                ],
                            }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvariantValidationError(
                                        existingVocabularyList.getCompositeIdentifier(),
                                        [
                                            new DuplicateValueForVocabularyListFilterPropertyValueError(
                                                nameOfPropertyWithReusedValue,
                                                dummyLabel1,
                                                reusedValue
                                            ),
                                            new DuplicateValueForVocabularyListFilterPropertyValueError(
                                                nameOfPropertyWithReusedValue,
                                                dummyLabel2,
                                                reusedValue
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

        describe(`when the filter property type is checkbox`, () => {
            const type = FilterPropertyType.checkbox;

            describe(`when the wrong number of allowed values is provided`, () => {
                const valuesToUse = [
                    {
                        value: false,
                        label: 'negative',
                    },
                    {
                        value: true,
                        label: 'positive',
                    },
                    {
                        value: 'bogus',
                        label: 'unfalse dichotomy',
                    },
                ];

                [0, 1, 3].forEach((numberOfAllowedValuesProvided) => {
                    const pluralSuffix = numberOfAllowedValuesProvided === 1 ? '' : 's';

                    describe(`when ${numberOfAllowedValuesProvided} allowed value${pluralSuffix} and label${pluralSuffix} is provided`, () => {
                        it(`should fail with the expected errors`, async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                systemUserId: dummySystemUserId,
                                seedInitialState: async () => {
                                    await testRepositoryProvider.addFullSnapshot(validInitialState);
                                },
                                buildCommandFSA: () =>
                                    commandFsaFactory.build(undefined, {
                                        type,
                                        allowedValuesAndLabels: valuesToUse.slice(
                                            0,
                                            numberOfAllowedValuesProvided
                                        ),
                                    }),
                            });
                        });
                    });
                });
            });

            describe(`when exactly 2 values and labels are provided`, () => {
                describe(`when one of the values is a string`, () => {
                    it(`should fail with the expected errors`, async () => {
                        const dummyName = 'checkbox property with an invalid string value';

                        const invalidValueAndLabel = {
                            /**
                             * Note that this is the string literal'false` and
                             * not the boolean `false`. Also note that this case
                             * is of interest because this is a very likely case
                             * to happen when pre-processing existing data, for
                             * example, when serializing a Python `dict` or pandas
                             * `Dataframe` to `json`.
                             */
                            value: 'False',
                            label: 'negative',
                        };

                        await assertCommandError(commandAssertionDependencies, {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider.addFullSnapshot(validInitialState);
                            },
                            buildCommandFSA: () =>
                                commandFsaFactory.build(undefined, {
                                    name: dummyName,
                                    type: FilterPropertyType.checkbox,
                                    allowedValuesAndLabels: [
                                        {
                                            value: true,
                                            label: 'positive',
                                        },
                                        invalidValueAndLabel,
                                    ],
                                }),
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new InvariantValidationError(
                                            existingVocabularyList.getCompositeIdentifier(),
                                            [
                                                new InvalidValueForCheckboxFilterPropertyError(
                                                    {
                                                        value: invalidValueAndLabel.value,
                                                        display: invalidValueAndLabel.label,
                                                    },
                                                    dummyName
                                                ),
                                            ]
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                /**
                 * The following tests are similar to the corresponding tests for selection filter properties above.
                 */
                describe(`when a label is repeated`, () => {
                    it.todo(`should fail with the expected errors`);
                });

                describe(`when a value is repeated`, () => {
                    it.todo(`should fail with the expected errors`);
                });
            });
        });

        /**
         * These are the same as always.
         */
        describe(`when the command payload type is invalid`, () => {
            describe(`when the aggregate type is not vocabularyList`, () => {
                it.todo(`should fail with the expected errors`);
            });

            describe(`fuzz test`, () => {
                it.todo(`should have a test`);
            });
        });
    });
});
