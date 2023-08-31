import { HasId } from '@coscrad/api-interfaces';
import { TestingModule } from '@nestjs/testing';
import { existsSync, rmSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { isDeepStrictEqual } from 'util';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../domain/common';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { buildFakeTimersConfig } from '../domain/models/__tests__/utilities/buildFakeTimersConfig';
import { ResourceType } from '../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { ArangoDatabaseDocument } from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { BASE_DIGITAL_ASSET_URL } from '../persistence/migrations/01/remove-base-digital-asset-url.migration';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `revert-latest-migration`;

const mockLogger = buildMockLogger();

process.env[BASE_DIGITAL_ASSET_URL] = `https://www.bogus.com/`;

const fakeTimersConfig = buildFakeTimersConfig();

// TODO share test setup?
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

describe(`**${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await testAppModule.init();

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
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(ArangoQueryRunner)
            .useValue(new ArangoQueryRunner(databaseProvider))
            .compile();

        jest.useFakeTimers(fakeTimersConfig);
    });

    describe(`when running migrations`, () => {
        const migrationUpDumpDir = `migration-1-RemoveBaseDigitalAssetUrl-${fakeTimersConfig.now}`;

        const dumpDir = `migration-REVERT-1-RemoveBaseDigitalAssetUrl-${fakeTimersConfig.now}`;

        const preFilepath = `${dumpDir}/pre-revert.data.json`;

        const postFilepath = `${dumpDir}/post-revert.data.json`;

        const cleanUpFiles = () => {
            [migrationUpDumpDir, dumpDir].forEach((dir) => {
                if (existsSync(dir)) {
                    rmSync(dir, { recursive: true, force: true });
                }
            });
        };

        const areArangoDocumentsEqual = <
            T extends ArangoDatabaseDocument<HasId> & { _rev: string }
        >(
            docA: T,
            docB: T
        ): boolean => {
            [docA, docB].forEach((doc) => {
                delete doc._rev;
            });
            return isDeepStrictEqual(docA, docB);
        };

        beforeEach(async () => {
            // clear the database
            await testRepositoryProvider.testSetup();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .create(oldPhotographDocument);

            cleanUpFiles();

            mockLogger.log.mockReset();
        });

        afterAll(async () => {
            cleanUpFiles();
        });

        it(`should run the migration`, async () => {
            const originalDocument = await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(oldPhotographDocument._key);

            // Arrange
            await CommandTestFactory.run(commandInstance, [`run-migrations`]);

            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const mergedLogMessages = mockLogger.log.mock.calls
                .map((callStringArgs) => callStringArgs.join(''))
                .join('; ');

            expect(mergedLogMessages.toLowerCase().includes(`searching`)).toBe(true);

            const finalDocument = await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(oldPhotographDocument._key);

            expect(
                areArangoDocumentsEqual(
                    originalDocument as ArangoDatabaseDocument<HasId> & { _rev: string },
                    finalDocument as ArangoDatabaseDocument<HasId> & { _rev: string }
                )
            ).toBe(true);
        });

        it(`should write a pre data-dump file`, async () => {
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(oldPhotographDocument._key);

            // Arrange
            await CommandTestFactory.run(commandInstance, [`run-migrations`]);

            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            expect(existsSync(preFilepath)).toBe(true);
        });

        it(`should write a post data-dump file`, async () => {
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .fetchById(oldPhotographDocument._key);

            // Arrange
            await CommandTestFactory.run(commandInstance, [`run-migrations`]);

            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            expect(existsSync(postFilepath)).toBe(true);
        });

        it(`should do nothing when there are no migrations to run`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            expect(existsSync(preFilepath)).toBe(false);

            expect(existsSync(postFilepath)).toBe(false);

            expect(
                mockLogger.log.mock.calls[1][0].toLowerCase().includes(`no migrations found`)
            ).toBe(true);
        });
    });
});
