import { TestingModule } from '@nestjs/testing';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../../app/app.module';
import createTestModule from '../../app/controllers/__tests__/createTestModule';
import { REPOSITORY_PROVIDER_TOKEN } from '../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../validation';
import { CoscradCliModule } from '../coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from '../logging';
import { buildMockLogger } from '../logging/__tests__';

const cliCommandName = 'performance-test';

const reportFilePath = 'performance-test.cli-command.spec.data.json';

describe(`CLI Command: **${cliCommandName}**`, () => {
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

        if (existsSync(reportFilePath)) {
            unlinkSync(reportFilePath);
        }
    });

    describe(`when the command is valid`, () => {
        describe(`when running a test for a single scenario`, () => {
            const targetScenario = 'importTermsToVocabularyList';

            const n = 1000;

            it(`should generate the expected report`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--scenario=${targetScenario}`,
                    `--n=${n}`,
                ]);

                const reportExists = existsSync(reportFilePath);

                expect(reportExists).toBe(true);

                const report = readFileSync(reportFilePath, { encoding: 'utf-8' });

                const contents = JSON.parse(report);

                expect(contents).toMatchSnapshot();
            });
        });
    });
});
