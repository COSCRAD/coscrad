import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceType } from '../domain/types/ResourceType';
import { NotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { BASE_DIGITAL_ASSET_URL } from '../persistence/migrations/01/remove-base-digital-asset-url.migration';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `run-migrations`;

const mockLogger = buildMockLogger();

process.env[BASE_DIGITAL_ASSET_URL] = `https://www.justfortests.io/uploads/`;

/**
 * Note that we have a detailed unit test of the actual
 * `RemoveBaseDigitalAssetUrl` migration. Here, we want to
 * integration test the `run-migrations` cli command. So we
 * are only doing a sanity check that one photograph document
 * gets updated by this command.
 *
 * Further, we do not type the document as we do not want to
 * update this test if we make further changes to the `Photograph`
 * domain model in the future. So we rely on the fact that behind the
 * scenes, the database doesn't know about the domain.
 */
const oldPhotographDocument = {
    _key: buildDummyUuid(1),
    type: ResourceType.photograph,
    filename: `flowers`,
    photographer: `James Rames`,
    dimensions: {
        widthPX: 300,
        heightPX: 400,
    },
    published: true,
};

describe(`run migrations`, () => {
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

        console.log(
            `running test with database: ${databaseProvider.getDBInstance().getDatabaseName()}`
        );

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(ArangoQueryRunner)
            .useValue(new ArangoQueryRunner(databaseProvider))
            .compile();
    });

    // TODO Update the setup and write all other migrations as already run dynamically
    describe(`when there is one migration to run`, () => {
        beforeEach(async () => {
            // clear the database
            await testRepositoryProvider.testSetup();

            // insert a single pre-migration format photograph document for a sanity check
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .create(oldPhotographDocument);
        });

        it(`should log a single message to the user upon running`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            expect(mockLogger.log).toHaveBeenCalledTimes(1);
        });

        it(`should run the migration with updates to the db`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const updatedDocument = await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(oldPhotographDocument._key);

            expect((updatedDocument as unknown as { imageUrl: string }).imageUrl).toBe(
                `https://www.justfortests.io/uploads/flowers.png`
            );

            expect((updatedDocument as unknown as { filename: string }).filename).toBeUndefined();

            const migrationSequenceNumber = 1;

            const migrationRecord = await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.migrations)
                .fetchById(migrationSequenceNumber.toString());

            expect(migrationRecord).not.toBe(NotFound);

            expect(migrationRecord).toMatchSnapshot();
        });
    });
});
