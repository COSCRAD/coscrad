import { TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
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
import { DomainDataExporter } from '../persistence/repositories/domain-data-exporter';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import convertInMemorySnapshotToDatabaseFormat from '../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';
import { DynamicDataTypeFinderService } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const originalEnv = process.env;

const cliCommandName = 'data-restore';

const outputDir = `__cli-command-test-files__`;

const outputFilePrefix = `./${outputDir}/${cliCommandName}`;

const buildFullFilepath = (suffix: string): string => `${outputFilePrefix}${suffix}.data.json`;

const fileToRestore = buildFullFilepath(`__restore-file__`);

describe(`CLI Command: **data-restore**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await testAppModule.init();

        const dynamicDataTypeFinderService = testAppModule.get(DynamicDataTypeFinderService);

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
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        const testDataInFlatFormat = buildTestDataInFlatFormat();

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

        if (existsSync(fileToRestore)) unlinkSync(fileToRestore);

        writeFileSync(
            fileToRestore,
            JSON.stringify(
                convertInMemorySnapshotToDatabaseFormat(
                    new DeluxeInMemoryStore(
                        testDataWithUniqueKeys
                    ).fetchFullSnapshotInLegacyFormat()
                ),
                null,
                4
            )
        );
        await testRepositoryProvider.testTeardown();
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
                const terms = await testRepositoryProvider
                    .forResource(AggregateType.term)
                    .fetchMany();

                // sanity check to ensure db has been emptied
                expect(terms).toEqual([]);

                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--filepath=${fileToRestore}`,
                ]);

                const dataExporter = new ArangoDataExporter(
                    new ArangoQueryRunner(databaseProvider)
                );

                const databaseSnapshot = await dataExporter.fetchSnapshot();

                const documentCollectionsNotInSnapshot = Object.values(
                    ArangoDocumentCollectionId
                ).filter((collectionId) =>
                    isNullOrUndefined(databaseSnapshot.document[collectionId]?.length)
                );

                /**
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(documentCollectionsNotInSnapshot).toEqual([]);

                const edgeCollectionsNotInSnapshot = Object.values(ArangoEdgeCollectionId).filter(
                    (collectionId) => isNullOrUndefined(databaseSnapshot.edge[collectionId]?.length)
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
                    fileToRestore,
                ]);

                const dataExporter = new DomainDataExporter(testRepositoryProvider);

                const inMemoryStore = await dataExporter.fetchSnapshot();

                const snapshot = inMemoryStore.fetchFullSnapshot();

                /**
                 * We could refactor this the same as the other test case. But
                 * since this is just a sanity check that the -f flag works instead
                 * of --filename, we have left it with the data check at the level of
                 * the domain (instead of persistence layer).
                 */
                const aggregatesNotInSnapshot = Object.values(AggregateType).reduce(
                    (acc: AggregateType[], aggregateType) =>
                        isNullOrUndefined(snapshot[aggregateType]) ||
                        snapshot[aggregateType]?.length === 0
                            ? acc.concat(aggregateType)
                            : acc,
                    []
                );

                const eventSourcedAggregateTypes = [AggregateType.digitalText, AggregateType.song];

                /**
                 * TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced models here
                 *
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(aggregatesNotInSnapshot).toEqual(eventSourcedAggregateTypes);
            });
        });
    });

    describe(`when the environment variable DATA_MODE is not set to 'import'`, () => {
        beforeEach(async () => {
            process.env.DATA_MODE = 'definitely_not_import';
        });

        afterEach(() => {
            process.env = originalEnv;
        });

        it(`should not import any data`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--filepath=${fileToRestore}`,
            ]);

            const dataExporter = new ArangoDataExporter(new ArangoQueryRunner(databaseProvider));

            const { document: allDocuments, edge: allEdges } = await dataExporter.fetchSnapshot();

            const nonEmptyCollections = [allDocuments, allEdges].flatMap((keysAndDocuments) =>
                Object.entries(keysAndDocuments).filter(([_key, documents]) => documents.length > 0)
            );

            expect(nonEmptyCollections).toEqual([]);
        });
    });
});
