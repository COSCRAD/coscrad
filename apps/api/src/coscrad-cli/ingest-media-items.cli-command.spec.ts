import { CommandModule } from '@coscrad/commands';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/Environment';
import { MediaItemModule } from '../app/domain-modules/media-item.module';
import { CoscradEventFactory, EventModule } from '../domain/common';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import { AggregateType } from '../domain/types/AggregateType';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'ingest-media-items';

const inputDir = `__cli-command-test-inputs__`;

const destinationDir = `__cli-command-test-files__`;

const inputFilePrefix = `./${inputDir}/${cliCommandName}`;

const buildDirectoryPath = (suffix: string) => `${inputFilePrefix}/${suffix}`;

describe(`CLI Command: **data-restore**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let testAppModule: TestingModule;

    beforeAll(async () => {
        testAppModule = await Test.createTestingModule({
            imports: [
                CommandModule,
                EventModule,
                DynamicDataTypeModule,
                PersistenceModule.forRootAsync(),
                MediaItemModule,
            ],
            providers: [
                {
                    provide: ConfigService,
                    useFactory: () =>
                        buildMockConfigServiceSpec(
                            {
                                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                            },
                            buildConfigFilePath(Environment.test)
                        ),
                },
                {
                    provide: TestRepositoryProvider,
                    useFactory: (
                        databaseProvider: ArangoDatabaseProvider,
                        coscradEventFactory: CoscradEventFactory,
                        dynamicDataTypeFinderService: DynamicDataTypeFinderService
                    ) =>
                        new TestRepositoryProvider(
                            databaseProvider,
                            coscradEventFactory,
                            dynamicDataTypeFinderService
                        ),
                    inject: [
                        ArangoDatabaseProvider,
                        CoscradEventFactory,
                        DynamicDataTypeFinderService,
                    ],
                },
            ],
        }).compile();

        // createTestModule({
        //     ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        // });

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

        if (!existsSync(destinationDir)) {
            mkdirSync(destinationDir);
        }
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when the media directory has some allowed media items only`, () => {
        it(`should ingest the media items`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--directory=${buildDirectoryPath(`mediaItemsOnly`)}`,
                `--baseUrl=http://localhost:3131/uploads`,
                `--staticAssetDestinationDirectory=${destinationDir}`,
            ]);

            const expectedNumberOfResults = 3;

            const searchResult = await testRepositoryProvider
                .forResource(AggregateType.mediaItem)
                .fetchMany();

            const mediaItems = searchResult.filter(validAggregateOrThrow);

            expect(mediaItems).toHaveLength(expectedNumberOfResults);
        }, 60000); // timeout of 60s
    });

    /**
     * TODO[test coverage]:
     * - Stres test
     * - When the directory has nested directories
     * - when the directory has other file types
     *
     * Note that this is an internal tool and not user facing.
     * We are not as concerned with comprehensive test coverage
     * until we expand its use.
     */
});
