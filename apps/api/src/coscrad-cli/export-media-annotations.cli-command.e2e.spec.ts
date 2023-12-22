import { EdgeConnectionType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, rmSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/Environment';
import { AudioVisualModule } from '../app/domain-modules/audio-visual.module';
import { EdgeConnectionModule } from '../app/domain-modules/edge-connection.module';
import getValidAggregateInstanceForTest from '../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory, EventModule } from '../domain/common';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { AudioItem } from '../domain/models/audio-item/entities/audio-item.entity';
import { Video } from '../domain/models/audio-item/entities/video.entity';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
} from '../domain/models/context/edge-connection.entity';
import { TimeRangeContext } from '../domain/models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../domain/models/context/types/EdgeConnectionContextType';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'export-media-annotations';

const outputDir = `__cli-command-test-files__`;

const buildOutputFilepath = (filename: string) => `${outputDir}/${filename}`;

// can we set this to false to hide console output?
const mockLogger = buildMockLogger({ isEnabled: true });

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
                AudioVisualModule,
                EdgeConnectionModule,
            ],
        })
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
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

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            testAppModule.get(CoscradEventFactory),
            testAppModule.get(DynamicDataTypeFinderService)
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
            .compile();

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        jest.resetAllMocks();
    });

    [AggregateType.audioItem, AggregateType.video].forEach((aggregateType) => {
        describe(`when there are annotations for a : ${aggregateType}`, () => {
            const inPointMilliseconds = 1034;

            const outPointMilliseconds = 3200.34;

            const lengthMilliseconds = 20 * outPointMilliseconds;

            const noteText = `this is the note`;

            const noteLanguageCode = LanguageCode.English;

            const note = buildMultilingualTextWithSingleItem(noteText, noteLanguageCode);

            const dummyAudiovisualItem = getValidAggregateInstanceForTest(aggregateType) as
                | AudioItem
                | Video;

            const existingAudiovisualItem = dummyAudiovisualItem.clone<AudioItem | Video>({
                lengthMilliseconds,
                published: true,
            });

            const context = new TimeRangeContext({
                type: EdgeConnectionContextType.timeRange,
                timeRange: {
                    inPointMilliseconds,
                    outPointMilliseconds,
                },
            });

            const idOfNoteForAudiovisualItem = buildDummyUuid(123);

            const noteForAudiovisualItem = new EdgeConnection({
                type: AggregateType.note,
                connectionType: EdgeConnectionType.self,
                members: [
                    new EdgeConnectionMember({
                        compositeIdentifier: existingAudiovisualItem.getCompositeIdentifier(),
                        context,
                        role: EdgeConnectionMemberRole.self,
                    }),
                ],
                note,
                id: idOfNoteForAudiovisualItem,
            });

            const dummyTag = getValidAggregateInstanceForTest(AggregateType.tag);

            const tagsForNote = ['publish', 'delete', 'follow-up-with-jones'].map((label, index) =>
                dummyTag.clone({
                    id: buildDummyUuid(index),
                    label,
                    members: [
                        {
                            type: AggregateType.note,
                            id: idOfNoteForAudiovisualItem,
                        },
                    ],
                })
            );

            // Note that we start indexing at 1 (human readable)
            const outputFilename = `${aggregateType}-${existingAudiovisualItem.id}-1.data.json`;

            const outputFilepath = buildOutputFilepath(outputFilename);

            describe(`when all input arguments are valid`, () => {
                beforeEach(async () => {
                    if (existsSync(outputFilepath)) {
                        rmSync(outputFilepath);
                    }

                    await testRepositoryProvider
                        .forResource(aggregateType)
                        .createMany([existingAudiovisualItem]);

                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.tag]: tagsForNote,
                            [AggregateType.note]: [noteForAudiovisualItem],
                        }).fetchFullSnapshotInLegacyFormat()
                    );

                    console.log('done');
                });

                it(`should write the expected data file`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--exportPath=${outputDir}`,
                        `--mediaType=all`,
                        // TODO support input query strings \ filters
                    ]);

                    const fileExists = existsSync(outputFilepath);

                    expect(fileExists).toBe(true);
                });
            });
        });
    });

    describe(`when there are no annotations`, () => {
        it(`should log a message stating that no annotations found`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--exportPath=${outputDir}`,
                `--mediaType=all`,
                // TODO support input query strings \ filters
            ]);

            const expectedMessage = 'no annotations found';

            const actualOutputText = mockLogger.log.mock.calls.map((args) => args[0]).join(',');

            // This pattern lets us see the output if the test fails
            const invalidOutput = [actualOutputText].filter(
                (text) => !text.toLowerCase().includes(expectedMessage)
            );

            expect(invalidOutput).toEqual([]);
        });
    });

    describe(`when the parameter [exportPath] is omitted`, () => {
        it(`exit with an error`, async () => {
            const tryCommand = async () =>
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--mediaType=all`,
                    // TODO support input query strings \ filters
                ]);

            expect(tryCommand).rejects;
        });
    });

    describe(`when the parameter [mediaType] is omitted`, () => {
        it(`exit with an error`, async () => {
            const tryCommand = async () =>
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--exportPath=${outputDir}`,
                ]);

            expect(tryCommand).rejects;
        });
    });
});
