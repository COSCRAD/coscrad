import { TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../domain/common';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { IdManagementService } from '../lib/id-generation/id-management.service';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { RemoveBaseDigitalAssetUrl } from '../persistence/migrations/01/remove-base-digital-asset-url.migration';
import { ArangoMigrationRecord } from '../persistence/migrations/arango-migration-record';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoIdRepository } from '../persistence/repositories/arango-id-repository';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'data-dump';

const outputDir = `__cli-command-test-files__`;

const outputFilePrefix = `./${outputDir}/${cliCommandName}`;

const buildFullFilepath = (suffix: string): string => `${outputFilePrefix}${suffix}.data.json`;

describe('CLI Command: **data-dump**', () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            // We don't need the event factory for this test
            new CoscradEventFactory([])
        );

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .compile();

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }
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

            /**
             * Add non-aggregate-root collections
             */
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.migrations).create(
                new ArangoMigrationRecord(new RemoveBaseDigitalAssetUrl(), {
                    description: `dummy migration description`,
                    dateAuthored: `20230518`,
                })
            );

            await new IdManagementService(new ArangoIdRepository(databaseProvider)).generate();
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

                // We only need a sanity check at the integration \ e2e level
                expect(doesFileExist).toBe(true);
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

                // We only need a sanity check at the integration \ e2e level

                expect(doesFileExist).toBe(true);
            });
        });
    });
});
