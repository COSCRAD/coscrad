import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { ICoscradMigration, Migration, Migrator } from '../persistence/migrations';
import { ArangoMigrationRecord } from '../persistence/migrations/arango-migration-record';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'list-migrations';

const dummyMigrationDescriptions = Array(3)
    .fill('')
    .map((_, index) => `dummy test migration ${index.toString()}`);

const dummyMigrationDates = ['20230503', '20230509', '20230622'];

const migration1Metadata = {
    description: dummyMigrationDescriptions[0],
    dateAuthored: dummyMigrationDates[0],
};

@Migration(migration1Metadata)
class DummyMigration1AlreadyRun implements ICoscradMigration {
    sequenceNumber = 101;

    name = 'dummy migration (1)';

    async up() {
        console.log(`1 up`);
    }

    async down() {
        console.log(`1 down`);
    }
}

@Migration({
    description: dummyMigrationDescriptions[1],
    dateAuthored: dummyMigrationDates[1],
})
class DummyMigration2 implements ICoscradMigration {
    sequenceNumber = 102;

    name = 'dummy migration (2)';

    async up() {
        console.log(`2 up`);
    }

    async down() {
        console.log(`2 down`);
    }
}

@Migration({
    description: dummyMigrationDescriptions[2],
    dateAuthored: dummyMigrationDates[2],
})
class DummyMigration3 implements ICoscradMigration {
    sequenceNumber = 103;

    name = 'dummy migration (3)';

    async up() {
        console.log(`3 up`);
    }

    async down() {
        console.log(`3 down`);
    }
}

const mockLogger = buildMockLogger();

describe(`CLI Command: **${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    const originalEnv = process.env;

    const dummyBaseUrl = 'https://www.myorg.io/assets/';

    const dummyMigrator = new Migrator();

    dummyMigrator
        .register(DummyMigration1AlreadyRun, {
            description: dummyMigrationDescriptions[0],
            dateAuthored: dummyMigrationDates[0],
        })
        .register(DummyMigration2, {
            description: dummyMigrationDescriptions[1],
            dateAuthored: dummyMigrationDates[1],
        })
        .register(DummyMigration3, {
            description: dummyMigrationDescriptions[2],
            dateAuthored: dummyMigrationDates[2],
        });

    beforeAll(async () => {
        process.env['BASE_DIGITAL_ASSET_URL'] = dummyBaseUrl;

        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await testAppModule.init();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        const databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = testAppModule.get(TestRepositoryProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(Migrator)
            .useValue(dummyMigrator)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .compile();

        await testRepositoryProvider.testSetup();

        await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.migrations)
            .create(new ArangoMigrationRecord(new DummyMigration1AlreadyRun(), migration1Metadata));
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it(`should list the available migrations`, async () => {
        await CommandTestFactory.run(commandInstance, [cliCommandName]);

        const logMessage = mockLogger.log.mock.calls[0][0];

        // Note that we ignore migration 1 as it has already been run
        const migrationDatesThatAreMissing = dummyMigrationDates
            .filter((_, index) => index !== 0)
            .filter((date) => !logMessage.includes(date));

        expect(migrationDatesThatAreMissing).toEqual([]);

        const migrationDescriptionsThatAreMissing = dummyMigrationDescriptions
            .filter((_, index) => index !== 0)

            .filter((description) => !logMessage.includes(description));

        expect(migrationDescriptionsThatAreMissing).toEqual([]);

        const isMigration1Listed =
            logMessage.includes(dummyMigrationDates[0]) ||
            logMessage.includes(dummyMigrationDescriptions[0]);

        expect(isMigration1Listed).toBe(false);
    });
});
