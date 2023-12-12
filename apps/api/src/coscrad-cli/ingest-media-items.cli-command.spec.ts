import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import { AggregateType } from '../domain/types/AggregateType';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DynamicDataTypeFinderService } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'ingest-media-items';

const inputDir = `__cli-command-test-files`;

const inputFilePrefix = `./${inputDir}/${cliCommandName}`;

const buildDirectoryPath = (suffix: string) => `${inputFilePrefix}/${suffix}`;

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
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();

        await testRepositoryProvider.testTeardown();
    });

    describe(`when the media directory has some allowed media items only`, () => {
        it(`should ingest the media items`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--directory=${buildDirectoryPath(`mediaItemsOnly`)}`,
            ]);

            const expectedNumberOfResults = 3;

            const searchResult = await testRepositoryProvider
                .forResource(AggregateType.mediaItem)
                .fetchMany();

            const mediaItems = searchResult.filter(validAggregateOrThrow);

            expect(mediaItems).toHaveLength(expectedNumberOfResults);
        });
    });
});
