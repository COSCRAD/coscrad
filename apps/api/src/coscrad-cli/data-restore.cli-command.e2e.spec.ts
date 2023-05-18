import { TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { DomainDataExporter } from '../persistence/repositories/domain-data-exporter';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import convertInMemorySnapshotToDatabaseFormat from '../test-data/utilities/convertInMemorySnapshotToDatabaseFormat';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'data-restore';

const outputDir = `__cli-command-test-files__`;

const outputFilePrefix = `./${outputDir}/${cliCommandName}`;

const buildFullFilepath = (suffix: string): string => `${outputFilePrefix}${suffix}.data.json`;

const fileToRestore = buildFullFilepath(`__restore-file__`);

describe(`CLI Command: **data-restore**`, () => {
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
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .compile();

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }
    });

    describe(`when the command is valid`, () => {
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

                const dataExporter = new DomainDataExporter(testRepositoryProvider);

                const inMemoryStore = await dataExporter.fetchSnapshot();

                const snapshot = inMemoryStore.fetchFullSnapshot();

                const aggregatesNotInSnapshot = Object.values(AggregateType).reduce(
                    (acc: AggregateType[], aggregateType) =>
                        isNullOrUndefined(snapshot[aggregateType]) ||
                        snapshot[aggregateType]?.length === 0
                            ? acc.concat(aggregateType)
                            : acc,
                    []
                );

                /**
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(aggregatesNotInSnapshot).toEqual([]);

                expect(snapshot).toMatchSnapshot();
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

                const aggregatesNotInSnapshot = Object.values(AggregateType).reduce(
                    (acc: AggregateType[], aggregateType) =>
                        isNullOrUndefined(snapshot[aggregateType]) ||
                        snapshot[aggregateType]?.length === 0
                            ? acc.concat(aggregateType)
                            : acc,
                    []
                );

                /**
                 * The test data is comprehensive, so checking that there is at
                 * least one instnace of each aggregate in the post-restore state
                 * is a good sanity check.
                 */
                expect(aggregatesNotInSnapshot).toEqual([]);
            });
        });
    });
});
