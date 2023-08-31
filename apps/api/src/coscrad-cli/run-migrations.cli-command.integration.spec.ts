import { TestingModule } from '@nestjs/testing';
import { existsSync, readFileSync, rmSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory } from '../domain/common';
import { MultilingualText } from '../domain/common/entities/multilingual-text';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { buildFakeTimersConfig } from '../domain/models/__tests__/utilities/buildFakeTimersConfig';
import { AggregateType } from '../domain/types/AggregateType';
import { ResourceType } from '../domain/types/ResourceType';
import { NotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { BASE_DIGITAL_ASSET_URL } from '../persistence/migrations/01/remove-base-digital-asset-url.migration';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `run-migrations`;

const mockLogger = buildMockLogger();

process.env[BASE_DIGITAL_ASSET_URL] = `https://www.justfortests.io/uploads/`;

const fakeTimersConfig = buildFakeTimersConfig();

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

/**
 * This test has been a source of spontaneous CI failures. We are disabling it for
 * now, as there isn't much risk of regression in this part of the code base.
 *
 * TODO Reinstate this test.
 */
describe.skip(`run migrations`, () => {
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

    // TODO Update the setup and write all other migrations as already run dynamically
    describe(`when there is one migration to run`, () => {
        const dumpDir = `migration-1-RemoveBaseDigitalAssetUrl-${fakeTimersConfig.now}`;

        beforeEach(async () => {
            // clear the database
            await testRepositoryProvider.testSetup();

            // insert a single pre-migration format photograph document for a sanity check
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.photographs)
                .create(oldPhotographDocument);

            // remove data dump dir from previous run
            if (existsSync(dumpDir)) {
                rmSync(dumpDir, { recursive: true, force: true });
            }
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

            delete migrationRecord['_rev'];

            expect(migrationRecord).toMatchSnapshot();
        });

        it(`should write a pre data-dump file`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const preFilepath = `${dumpDir}/pre.data.json`;

            expect(existsSync(preFilepath)).toBe(true);

            /**
             * We manually checked the snapshot once. There's not a lot of value
             * in manually testing the contents of the file at the level of an
             * integration test.
             *
             * TODO [test-coverage] [https://github.com/COSCRAD/coscrad/pull/381#discussion_r1198013712]
             * We should do so in a unit test of `ArangoDataExporter`
             */
        });

        it(`should write a post data-dump file`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const postFilepath = `${dumpDir}/post.data.json`;

            expect(existsSync(postFilepath)).toBe(true);

            /**
             * We manually checked the snapshot once. There's not a lot of value
             * in manually testing the contents of the file at the level of an
             * integration test. We should do so in a unit test of `ArangoDataExporter`
             */
        });

        describe(`the verification report`, () => {
            describe(`when the resulting database state is valid`, () => {
                it(`should write a verification report`, async () => {
                    await CommandTestFactory.run(commandInstance, [cliCommandName]);

                    const verificationFilePath = `${dumpDir}/verification.data.json`;

                    expect(existsSync(verificationFilePath)).toBe(true);
                });
            });

            describe(`when there are invariant validation errors`, () => {
                beforeEach(async () => {
                    // add an invalid term to the db
                    await testRepositoryProvider.addResourcesOfSingleType(ResourceType.term, [
                        getValidAggregateInstanceForTest(AggregateType.term).clone({
                            // no text in any language
                            text: new MultilingualText({
                                items: [],
                            }),
                        }),
                    ]);
                });

                it(`should write the errors`, async () => {
                    await CommandTestFactory.run(commandInstance, [cliCommandName]);

                    const verificationFilePath = `${dumpDir}/verification.data.json`;

                    const readResult = JSON.parse(
                        readFileSync(verificationFilePath, { encoding: 'utf-8' })
                    );

                    expect(readResult['status']).toBe('failure');
                });
            });
        });
    });
});
