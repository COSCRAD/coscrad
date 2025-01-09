import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { VocabularyList } from '../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { ResourceType } from '../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'execute-command-stream';

const fixtureName = `users:create-admin`;

const dataFile = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.valid.SAMPLE.json`;

const dataFileWithJoin = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.valid.with-join.SAMPLE.json`;

const invalidDataFile = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.invalid.SAMPLE.json`;

describe(`CLI Command: ${cliCommandName}`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    /* eslint-disable @typescript-eslint/no-unused-vars */
    let databaseProvider: ArangoDatabaseProvider;

    const mockLogger = buildMockLogger({ isEnabled: true });

    beforeEach(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

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
            .overrideProvider(DynamicDataTypeModule)
            .useValue(DynamicDataTypeModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();

        await testAppModule.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

        await testRepositoryProvider.testTeardown();

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
