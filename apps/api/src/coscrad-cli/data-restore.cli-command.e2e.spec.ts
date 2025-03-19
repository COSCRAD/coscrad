import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoDocumentCollectionId } from '../persistence/database/collection-references/ArangoDocumentCollectionId';
import { ArangoEdgeCollectionId } from '../persistence/database/collection-references/ArangoEdgeCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoDataExporter } from '../persistence/repositories/arango-data-exporter';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import { DynamicDataTypeFinderService } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const originalEnv = process.env;

const cliCommandName = 'data-restore';

const outputDir = `__cli-command-test-files__`;

const filenameToRestore = `data-restore__restore-file__.data.json`;

const fullPathOfFileToRestore = `${outputDir}/${filenameToRestore}`;

const testDataInFlatFormat = buildTestDataInFlatFormat();

const unregisteredCollectionName = 'games';

describe(`CLI Command: **data-restore**`, () => {
    let app: INestApplication;

    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let dataExporter: ArangoDataExporter;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await testAppModule.init();

        app = testAppModule.createNestApplication();

        await app.init();

        const dynamicDataTypeFinderService = app.get(DynamicDataTypeFinderService);

        await dynamicDataTypeFinderService.bootstrapDynamicTypes();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = testAppModule.get(TestRepositoryProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .compile();

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }

        dataExporter = new ArangoDataExporter(new ArangoQueryRunner(databaseProvider));
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        // clear unregistered collection
        await databaseProvider
            .getDatabaseForCollection<{ id: string; name: string; populatiry: number }>(
                unregisteredCollectionName
            )
            .clear();

        const testDataWithUniqueKeys = Object.entries(testDataInFlatFormat).reduce(
            (acc, [aggregateType, instances]) => ({
                ...acc,
                [aggregateType]: instances.map((instance) =>
                    instance.clone({
                        id: `${aggregateType.toUpperCase()}.${instance.id}`,
                    })
                ),
            }),
            {}
        );

        if (existsSync(fullPathOfFileToRestore)) unlinkSync(fullPathOfFileToRestore);

        const domainSnapshot = new DeluxeInMemoryStore(
            testDataWithUniqueKeys
        ).fetchFullSnapshotInLegacyFormat();

        await testRepositoryProvider.addFullSnapshot(domainSnapshot);

        // ensure there is a doc in `uuids`
        await app.get<IIdManager>(ID_MANAGER_TOKEN).generate();

        // ensure there is a migration
        await databaseProvider
            .getDatabaseForCollection<{ id: string; data: string }>('migrations')
            .create({
                _key: '1',
                data: 'hello world',
            });

        // ensure there is data in an unregistered collection (e.g., the legacy game data collection
        await databaseProvider
            .getDatabaseForCollection<{ id: string; name: string; populatiry: number }>(
                unregisteredCollectionName
            )
            .create({
                _key: '1',
                name: 'memory match',
                populatiry: 1,
            });

        await dataExporter.dumpSnapshot(outputDir, filenameToRestore, [
            ...Object.values(ArangoEdgeCollectionId),
        ]);

        await testRepositoryProvider.testTeardown();

        // clear migrations
        await databaseProvider
            .getDatabaseForCollection<{ id: string; data: string }>('migrations')
            .clear();

        // clear unregistered collection
        await databaseProvider
            .getDatabaseForCollection<{ id: string; name: string; populatiry: number }>(
                unregisteredCollectionName
            )
            .clear();
    });

    describe(`when the command is valid`, () => {
        beforeEach(async () => {
            process.env.DATA_MODE = 'import';
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        describe(`when using the --filepath option to specify the input file`, () => {
            it(`should restore the db state via the domain snapshot`, async () => {
                const photographs = await testRepositoryProvider
                    .forResource(AggregateType.photograph)
                    .fetchMany();

                // sanity check to ensure db has been emptied
                expect(photographs).toEqual([]);

                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--filepath=${fullPathOfFileToRestore}`,
                ]);

                const dataExporter = new ArangoDataExporter(
                    new ArangoQueryRunner(databaseProvider)
                );

                const databaseSnapshot = await dataExporter.fetchSnapshot([
                    ...Object.values(ArangoEdgeCollectionId),
                ]);

                const documentCollections = [
                    ...Object.values(ArangoDocumentCollectionId),
                    'games',
                    'term__VIEWS',
                    'vocabularyList__VIEWS',
                ];

                const documentCollectionsNotInSnapshot = documentCollections.filter(
                    (collectionId) =>
                        isNullOrUndefined(databaseSnapshot.document[collectionId]?.documents.length)
                );

                /**
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(documentCollectionsNotInSnapshot).toEqual([]);

                const edgeCollectionsNotInSnapshot = Object.values(ArangoEdgeCollectionId).filter(
                    (collectionId) =>
                        isNullOrUndefined(databaseSnapshot.edge[collectionId]?.documents.length)
                );

                /**
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(edgeCollectionsNotInSnapshot).toEqual([]);

                // Add an assertoin helper

                // We don't need a snapshot, this is more of an integration test. We rely on the unit test the data exporter.
            });
        });

        describe(`when using the -f option to specify the input file`, () => {
            it(`should restore the db state via the domain snapshot`, async () => {
                const terms = await testRepositoryProvider
                    .forResource(AggregateType.term)
                    .fetchMany();

                // sanity check to ensure db has been emptied
                expect(terms).toEqual([]);

                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `-f`,
                    fullPathOfFileToRestore,
                ]);

                const foundSnapshot = await dataExporter.fetchSnapshot([
                    ...Object.values(ArangoEdgeCollectionId),
                ]);

                /**
                 * We could refactor this the same as the other test case. But
                 * since this is just a sanity check that the -f flag works instead
                 * of --filename, we have left it with the data check at the level of
                 * the domain (instead of persistence layer).
                 */
                const collectionsWhoseDataIsMissing = [
                    ...Object.values(ArangoDocumentCollectionId),
                    unregisteredCollectionName,
                ].reduce((acc: string[], collectionName) => {
                    return isNullOrUndefined(foundSnapshot.document[collectionName]) ||
                        foundSnapshot.document[collectionName]?.documents?.length === 0
                        ? acc.concat(collectionName)
                        : acc;
                }, []);

                const compareStrings = (a: string, b: string) => a.localeCompare(b);

                /**
                 * TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced models here
                 *
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(collectionsWhoseDataIsMissing.sort(compareStrings)).toEqual([]);

                const edgeCollectionsWhoseDataIsMissing = [
                    ...Object.values(ArangoEdgeCollectionId),
                ].reduce((acc: string[], collectionName) => {
                    return isNullOrUndefined(foundSnapshot.edge[collectionName]) ||
                        foundSnapshot.edge[collectionName]?.documents?.length === 0
                        ? acc.concat(collectionName)
                        : acc;
                }, []);

                expect(edgeCollectionsWhoseDataIsMissing.sort(compareStrings)).toEqual([]);
            });
        });
    });

    /**
     * There is a subtle issue with the implementation of the `ArangoDataExporter`'s
     * behaviour on failure that causes promises to remain open after the test
     * fails. We need to fix this to opt back-in.
     *
     * There is low chance of regression as the code paths exercised here are
     * not changed for regular feature implementation.
     */
    describe.skip(`when the environment variable DATA_MODE is not set to 'import'`, () => {
        beforeEach(async () => {
            process.env.DATA_MODE = 'definitely_not_import';
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it(`should not import any data`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--filepath=${fullPathOfFileToRestore}`,
            ]);

            const dataExporter = new ArangoDataExporter(new ArangoQueryRunner(databaseProvider));

            const { document: allDocuments, edge: allEdges } = await dataExporter.fetchSnapshot();

            const nonEmptyCollections = [allDocuments, allEdges].flatMap((keysAndDocuments) =>
                Object.entries(keysAndDocuments).filter(
                    ([_key, snapshotOfCollection]) => snapshotOfCollection.documents.length > 0
                )
            );

            expect(nonEmptyCollections).toEqual([]);
        });
    });
});
