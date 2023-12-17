import { CommandModule } from '@coscrad/commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/Environment';
import { EdgeConnectionModule } from '../app/domain-modules/edge-connection.module';
import { MediaItemModule } from '../app/domain-modules/media-item.module';
import { CoscradEventFactory, EventModule } from '../domain/common';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'export-media-annotations';

const outputDir = `__cli-command-test-files__`;

const buildOutputFilepath = (filename: string) => `${outputDir}/${filename}`;

const outputFilename = `test-media-annotations-1.data.json`;

const outputFilepath = buildOutputFilepath(outputFilename);

describe(`CLI Command: **${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let testAppModule: TestingModule;

    beforeAll(async () => {
        testAppModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                CommandModule,
                EventModule,
                DynamicDataTypeModule,
                PersistenceModule.forRootAsync(),
                MediaItemModule,
                EdgeConnectionModule,
            ],
            providers: [
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
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigServiceSpec(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

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
        if (existsSync(outputFilepath)) {
            rmSync(outputFilepath);
        }

        await testRepositoryProvider.testSetup();
    });

    describe(`when all input arguments are valid`, () => {
        it(`should write the expected data file`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--exportPath=${outputFilepath}`,
                `--mediaType=all`,
                // TODO support input query strings \ filters
            ]);

            const fileExists = existsSync(outputFilename);

            expect(fileExists).toBe(true);
        });
    });
});
