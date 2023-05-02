import { CommandTestFactory } from 'nest-commander-testing';
import { CoscradCliModule } from './coscrad-cli.module';

import { TestingModule } from '@nestjs/testing';
import { existsSync, readFileSync, unlinkSync } from 'fs';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';

const cliCommandName = 'domain-dump';

const outputFilePrefix = `__cli-command-test-files__/${cliCommandName}`;

const buildFullFilepath = (suffix: string): string => `${outputFilePrefix}${suffix}.data.json`;

describe('Task Command', () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        const databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .compile();
    });

    describe(`when the command is invalid`, () => {
        describe(`when the required option "filename" is not provided`, () => {
            /**
             * It's tricky to test when the process exits with status 1. Jest doesn't
             * safely wrap this and the test will fail.
             */
            it.todo(`should fail`);
        });
    });

    describe(`when the command is valid`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.testTeardown();

            await testRepositoryProvider.addFullSnapshot(
                new DeluxeInMemoryStore(
                    buildTestDataInFlatFormat()
                ).fetchFullSnapshotInLegacyFormat()
            );
        });

        describe(`when using the full --filepath input option`, () => {
            const filepath = buildFullFilepath('_filepath');

            beforeEach(async () => {
                if (existsSync(filepath)) unlinkSync(filepath);
            });

            it('should write a dump file', async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--filepath=${filepath}`,
                ]);

                const doesFileExist = existsSync(filepath);

                expect(doesFileExist).toBe(true);

                const fileContents = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

                expect(fileContents).toMatchSnapshot();
            });
        });

        describe(`when using the full -f input option`, () => {
            const filepath = buildFullFilepath('_f');

            beforeEach(async () => {
                if (existsSync(filepath)) unlinkSync(filepath);
            });

            it('should write a dump file', async () => {
                await CommandTestFactory.run(commandInstance, [cliCommandName, '-f', filepath]);

                const doesFileExist = existsSync(filepath);

                expect(doesFileExist).toBe(true);

                const fileContents = JSON.parse(readFileSync(filepath, { encoding: 'utf-8' }));

                expect(fileContents).toMatchSnapshot();
            });
        });
    });
});
