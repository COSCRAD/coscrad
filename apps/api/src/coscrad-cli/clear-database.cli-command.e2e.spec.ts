import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import { CoscradCliModule } from './coscrad-cli.module';

const originalEnv = process.env;

const cliCommandName = 'clear-database';

describe(`CLI Command: **clear-database**`, () => {
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

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .compile();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        const testDataAsSnapshot = new DeluxeInMemoryStore(
            buildTestDataInFlatFormat()
        ).fetchFullSnapshotInLegacyFormat();

        await testRepositoryProvider.addFullSnapshot(testDataAsSnapshot);

        /**
         * We add some fake documents to the following collections because they
         * are not included in test data and will be empty otherwise.
         */
        await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.migrations)
            .create({ _key: '1' });

        await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.uuids)
            .create({ _key: '2' });
    });

    describe(`when the environment variable $DATA_MODE is set to: _CYPRESS_`, () => {
        beforeEach(async () => {
            process.env.DATA_MODE = '_CYPRESS_';
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it(`should succeed`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const collectionNamesAndContents = await Promise.all(
                Object.values(ArangoCollectionId).map(
                    (collectionName): Promise<[string, unknown[]]> =>
                        databaseProvider
                            .getDBInstance()
                            .fetchMany(collectionName)
                            .then((documents: unknown[]): [string, unknown[]] => [
                                collectionName,
                                documents,
                            ])
                )
            );

            const nonEmptyCollections = collectionNamesAndContents
                .filter(([_, documents]) => documents.length > 0)
                .map(([collectionName, _]) => collectionName);

            expect(nonEmptyCollections).toEqual([]);
        });
    });

    describe(`when the environment variable $DATA_MODE is not set to _CYPRESS_`, () => {
        beforeEach(async () => {
            process.env.DATA_MODE = 'NOT-CYPRESS';
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it(`should not delete any data`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const collectionNamesAndContents = await Promise.all(
                Object.values(ArangoCollectionId).map(
                    (collectionName): Promise<[string, unknown[]]> =>
                        databaseProvider
                            .getDBInstance()
                            .fetchMany(collectionName)
                            .then((documents: unknown[]): [string, unknown[]] => [
                                collectionName,
                                documents,
                            ])
                )
            );

            const nonEmptyCollections = collectionNamesAndContents
                .filter(([_, documents]) => documents.length > 0)
                .map(([collectionName, _]) => collectionName);

            // TODO Tighten this check
            expect(nonEmptyCollections).toEqual(Object.values(ArangoCollectionId));
        });
    });

    describe(`when the environment variable $DATA_MODE is not set`, () => {
        it(`should not delete any data`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const collectionNamesAndContents = await Promise.all(
                Object.values(ArangoCollectionId).map(
                    (collectionName): Promise<[string, unknown[]]> =>
                        databaseProvider
                            .getDBInstance()
                            .fetchMany(collectionName)
                            .then((documents: unknown[]): [string, unknown[]] => [
                                collectionName,
                                documents,
                            ])
                )
            );

            const nonEmptyCollections = collectionNamesAndContents
                .filter(([_, documents]) => documents.length > 0)
                .map(([collectionName, _]) => collectionName);

            // TODO Tighten this check
            expect(nonEmptyCollections).toEqual(Object.values(ArangoCollectionId));
        });
    });
});
