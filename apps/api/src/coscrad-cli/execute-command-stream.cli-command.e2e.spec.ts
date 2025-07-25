import { AggregateType } from '@coscrad/api-interfaces';
import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { ARANGO_BULK_JOB_COLLECTION_NAME } from '../app/controllers/command/bulk-imports/arango-bulk-job-repository';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from '../app/controllers/command/bulk-imports/bulk-job-repository.interface';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { TermCreated } from '../domain/models/term/commands';
import {
    VocabularyListCreated,
    VocabularyListFilterPropertyRegistered,
} from '../domain/models/vocabulary-list/commands';
import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../test-data/events';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'execute-command-stream';

const fixtureName = `users:create-admin`;

const dataFile = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.valid.SAMPLE.json`;

const dataFileWithExistingUuids = `/home/tngdev/Apps/open-source-language-apps/COSCRAD/coscrad/apps/api/src/coscrad-cli/execute-command-stream.cli-command.valid.deep-real-uuids.SAMPLE.json`;

const dataFileWithJoin = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.valid.with-join.SAMPLE.json`;

const invalidDataFile = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.invalid.SAMPLE.json`;

const dataFileWithExistingUuidNoSlugs = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.uuid-not-slugs.SAMPLE.json`;

describe(`CLI Command: ${cliCommandName}`, () => {
    let bulkJobRepo: IBulkJobRepository;

    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let idGenerator: IIdManager;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    let databaseProvider: ArangoDatabaseProvider;

    const mockLogger = buildMockLogger({ isEnabled: true });

    const assertBulkJobPersisted = async () => {
        const allJobs = await bulkJobRepo.fetchMany();

        expect(allJobs).toHaveLength(1);
    };

    beforeEach(async () => {
        const testAppModule = await createTestModule(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            },
            {
                shouldMockIdGenerator: true,
            }
        );

        await testAppModule.init();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = testAppModule.get(TestRepositoryProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider('ID_MANAGER')
            .useValue(testAppModule.get('ID_MANAGER'))
            .overrideProvider(DynamicDataTypeModule)
            .useValue(DynamicDataTypeModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            // TODO remove use of `createTestModule` here. It really causes problems.
            .overrideProvider(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
            .useValue(testAppModule.get(BULK_JOB_REPOSITORY_INJECTION_TOKEN))
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();

        await testAppModule.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

        idGenerator = testAppModule.get(ID_MANAGER_TOKEN);

        await testRepositoryProvider.testTeardown();

        await databaseProvider.getDatabaseForCollection(ARANGO_BULK_JOB_COLLECTION_NAME).clear();

        bulkJobRepo = testAppModule.get(BULK_JOB_REPOSITORY_INJECTION_TOKEN);

        jest.clearAllMocks();
    });

    describe(`when the [name] property is specified`, () => {
        describe(`when the command is valid`, () => {
            describe(`when executing the command fixture with name: ${fixtureName}`, () => {
                jest.setTimeout(30000); // ms
                it(`should succeed`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--name=${fixtureName}`,
                    ]);

                    const numberOfUsers = await testRepositoryProvider
                        .getUserRepository()
                        .getCount();

                    expect(numberOfUsers).toBeGreaterThan(0);

                    await assertBulkJobPersisted();
                });
            });
        });
    });

    describe(`when the [data-file] option is specified`, () => {
        describe(`when the command is valid`, () => {
            describe(`when there are generated IDs, but no joins`, () => {
                it(`should succeed with the expected updates`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--data-file=${dataFile}`,
                    ]);

                    const numberOfTerms = await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .getCount();

                    expect(numberOfTerms).toBeGreaterThan(0);

                    await assertBulkJobPersisted();
                });
            });

            describe(`when there are generated IDs and joins (i.e., referential properties with APPEND_THIS_ID)`, () => {
                it(`should succeed with the expected updates`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--data-file=${dataFileWithJoin}`,
                    ]);

                    const numberOfTerms = await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .getCount();

                    expect(numberOfTerms).toBeGreaterThan(0);

                    const vocabularyLists = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchMany();

                    expect(vocabularyLists).toHaveLength(1);

                    const foundList = vocabularyLists[0];

                    expect(foundList).toBeInstanceOf(VocabularyList);

                    const numberOfEntries = (foundList as VocabularyList).entries.length;

                    expect(numberOfEntries).toBe(1);

                    await assertBulkJobPersisted();
                });
            });

            describe(`when there are deep references using pre-existing UUIDs and not generated or appended IDs`, () => {
                /**
                 * The following 2 IDs are magic strings in the test FSAs file.
                 */
                const vocabularyListId = buildDummyUuid(1);

                const termId = buildDummyUuid(2);

                const vocabularyListEvents = new TestEventStream()
                    .andThen<VocabularyListCreated>({
                        type: 'VOCABULARY_LIST_CREATED',
                    })
                    .andThen<VocabularyListFilterPropertyRegistered>({
                        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
                        // this magically lines up with the fixture file
                        payload: {
                            name: 'number',
                            allowedValuesAndLabels: [
                                {
                                    value: '1',
                                    label: 'one',
                                },
                            ],
                        },
                    })
                    .as({
                        type: AggregateType.vocabularyList,
                        id: vocabularyListId,
                    });

                const termEvents = new TestEventStream()
                    .andThen<TermCreated>({
                        type: 'TERM_CREATED',
                    })
                    .as({
                        type: AggregateType.term,
                        id: termId,
                    });

                beforeEach(async () => {
                    await testRepositoryProvider
                        .getEventRepository()
                        .appendEvents([...vocabularyListEvents, ...termEvents]);
                });

                it(`should succeed`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--data-file=${dataFileWithExistingUuids}`,
                    ]);

                    const numberOfTerms = await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .getCount();

                    expect(numberOfTerms).toBe(1);

                    await assertBulkJobPersisted();
                });
            });

            describe(`when only existing IDs are used (no slugs)`, () => {
                it(`should succeed`, async () => {
                    /**
                     * The data file holds the UUID `41fb2d7f-c483-4e09-a1f0-e9909a6b0001`
                     * which is a very magic number. We know this is the first ID
                     * to be generated by the `MockIdGenerator`.
                     */
                    await idGenerator.generate();

                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--data-file=${dataFileWithExistingUuidNoSlugs}`,
                    ]);

                    const numberOfTerms = await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .getCount();

                    expect(numberOfTerms).toEqual(1);

                    await assertBulkJobPersisted();
                });
            });
        });

        describe(`when the file does not exist`, () => {
            it(`should fail with the correct message`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--data-file=sorry-mario.data.json`,
                ]);

                const message = mockLogger.log.mock.calls[0][0];

                const expectedText = `Failed to parse`;

                const invalidMessages = [message].filter((m) => !m.includes(expectedText));

                expect(invalidMessages).toEqual([]);
            });
        });

        describe(`when the file exists, but the slugs are invalidly formatted`, () => {
            it(`should fail`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--data-file=${invalidDataFile}`,
                ]);

                const message = mockLogger.log.mock.calls[0][0];

                const expectedText = `invalid slug definition`;

                const invalidMessages = [message].filter((m) => !m.includes(expectedText));

                expect(invalidMessages).toEqual([]);
            });
        });
    });

    describe(`when both [data-file] and [name] are specified`, () => {
        it(`should fail with the expected error`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--name=${fixtureName}`,
                `--data-file=${dataFile}`,
            ]);

            const message = mockLogger.log.mock.calls[0][0];

            const expectedText = `only specify one`;

            const invalidMessages = [message].filter((m) => !m.includes(expectedText));

            expect(invalidMessages).toEqual([]);
        });
    });

    describe(`when neither [data-file] nor [name] is specified`, () => {
        it(`should fail with the expected error`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const message = mockLogger.log.mock.calls[0][0];

            const expectedText = `exactly one of`;

            const invalidMessages = [message].filter((m) => !m.includes(expectedText));

            expect(invalidMessages).toEqual([]);
        });
    });
});
