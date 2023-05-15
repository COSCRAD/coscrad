import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { ICoscradMigration } from '../persistence/migrations/coscrad-migration.interface';
import { Migration } from '../persistence/migrations/decorators/migration.decorator';
import { Migrator } from '../persistence/migrations/migrator';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_CLI_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'list-migrations';

const dummyMigrationDescriptions = Array(3)
    .fill('')
    .map((_, index) => `dummy test migration ${index.toString()}`);

const dummyMigrationDates = ['20230503', '20230509', '20230622'];

@Migration({
    description: dummyMigrationDescriptions[0],
    dateAuthored: dummyMigrationDates[0],
})
class DummyMigration1 implements ICoscradMigration {
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
        .register(DummyMigration1, {
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
            .overrideProvider(Migrator)
            .useValue(dummyMigrator)
            .overrideProvider(COSCRAD_CLI_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it(`should list the available migrations`, async () => {
        await CommandTestFactory.run(commandInstance, [cliCommandName]);

        const logMessage = mockLogger.log.mock.calls[0][0];

        const migrationDatesThatAreMissing = dummyMigrationDates.filter(
            (date) => !logMessage.includes(date)
        );

        expect(migrationDatesThatAreMissing).toEqual([]);

        const migrationDescriptionsThatAreMissing = dummyMigrationDescriptions.filter(
            (description) => !logMessage.includes(description)
        );

        expect(migrationDescriptionsThatAreMissing).toEqual([]);
    });
});
