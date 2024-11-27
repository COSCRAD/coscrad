import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigService from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/Environment';
import { CoscradEventFactory, CoscradEventUnion } from '../domain/common';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { ArangoRepositoryProvider } from '../persistence/repositories/arango-repository.provider';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const originalEnv = process.env;

const cliCommandName = 'seed-database';

describe(`**${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const mockConfigService = buildMockConfigService(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                SHOULD_ENABLE_LEGACY_GAMES_ENDPOINT: 'true',
            },
            buildConfigFilePath(Environment.test)
        );

        const testAppModule = await Test.createTestingModule({
            providers: [
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: CoscradEventUnion,
                    useValue: CoscradEventUnion,
                },
            ],
            imports: [DynamicDataTypeModule, PersistenceModule.forRootAsync()],
        }).compile();

        await testAppModule.init();

        const dynamicDataTypeFinderService = testAppModule.get(DynamicDataTypeFinderService);

        await dynamicDataTypeFinderService.bootstrapDynamicTypes();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        const coscradEventFactory = testAppModule.get(CoscradEventFactory);

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            coscradEventFactory,
            dynamicDataTypeFinderService
        );

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(CoscradEventFactory)
            .useValue(coscradEventFactory)
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .overrideProvider(ArangoRepositoryProvider)
            .useValue(
                new ArangoRepositoryProvider(
                    databaseProvider,
                    coscradEventFactory,
                    dynamicDataTypeFinderService
                )
            )
            .compile();

        // TODO how does this interact with the config?
        const doesCollectionExist = (
            await arangoConnectionProvider.getConnection().listCollections()
        ).some((c) => c.name === 'games');

        if (!doesCollectionExist) {
            await arangoConnectionProvider.getConnection().createCollection('games');
        }

        process.env.NODE_ENV = 'e2e';
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        await databaseProvider.getDatabaseForCollection('games').clear();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when data is provided for a known collection`, () => {
        type TestDoc = {
            foo: number;
            bar: {
                baz: string;
            };
        };

        const testDoc: TestDoc = {
            foo: 1,
            bar: {
                baz: 'test-value',
            },
        };

        /**
         * Seeding legacy game data for the alphabet
         * cypress tests is the main use case of this CLI command.
         */
        const testCollectionName = 'games';

        it(`should seed the data`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `collectionName=${testCollectionName}`,
                `--docs=${JSON.stringify([testDoc])}`,
                `--collectionName=${testCollectionName}`,
            ]);

            const allDocsInTestCollection = await databaseProvider
                .getDatabaseForCollection(testCollectionName)
                .fetchMany();

            expect(allDocsInTestCollection).toHaveLength(1);

            const firstDoc = allDocsInTestCollection[0] as unknown as TestDoc;

            /**
             * Note that the actual doc has Arango props like _rev, and _key
             * because we don't yet have a mapping layer- this is the raw db.
             */
            const valueToCompare: TestDoc = {
                foo: firstDoc.foo,
                bar: firstDoc.bar,
            };

            expect(valueToCompare).toEqual(testDoc);
        });
    });

    describe(`when the docs property is not a serialized array of objects`, () => {
        /**
         * Seeding legacy game data for the alphabet
         * cypress tests is the main use case of this CLI command.
         */
        const testCollectionName = 'games';

        it(`should fail`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `collectionName=${testCollectionName}`,
                `--docs=${JSON.stringify('foobarbaz')}`,
                `--collectionName=${testCollectionName}`,
            ]);

            // TODO assert failure message \ state
            // TODO assert nothing was written to the db
        });
    });

    describe(`when the collection name is not known`, () => {
        it.todo('should fail');
    });
});
