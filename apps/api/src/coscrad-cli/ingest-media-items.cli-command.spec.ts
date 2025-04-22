import { CommandModule } from '@coscrad/commands';
import { isFiniteNumber } from '@coscrad/validation-constraints';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/environment';
import { CoscradEventFactory, EventModule } from '../domain/common';
import { AudioItem } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { Video } from '../domain/models/audio-visual/video/entities/video.entity';
import { MediaItemModule } from '../domain/models/media-item';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { Photograph } from '../domain/models/photograph/entities/photograph.entity';
import { validAggregateOrThrow } from '../domain/models/shared/functional';
import { AggregateType } from '../domain/types/AggregateType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
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

// the number of items in `__cli-command-test-inputs__/ingest-media-items/media-items-only/`
const expectedNumberOfMediaItemsCreated = 13;

const testDbName = generateDatabaseNameForTestSuite();

/**
 * TODO Diagnose why this test is flakey when run by the CI.
 */
describe(`CLI Command: **ingest-media-items**`, () => {
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
                EventModule,
                MediaItemModule,
            ],
            providers: [
                {
                    provide: ConfigService,
                    useFactory: () =>
                        buildMockConfigServiceSpec(
                            {
                                ARANGO_DB_NAME: testDbName,
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
                    ) => {
                        return new TestRepositoryProvider(
                            databaseProvider,
                            coscradEventFactory,
                            dynamicDataTypeFinderService
                        );
                    },
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
                        ARANGO_DB_NAME: testDbName,
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

        /**
         * Should the files in `destinationDir` be wiped between tests?  The
         * command seems to skip files that are already there when the test has
         * run once.
         */
        if (!existsSync(destinationDir)) {
            mkdirSync(destinationDir);
        }
    });

    describe(`when the media directory has some allowed media items only`, () => {
        describe(`when publication (of media item) and resource creation is requested`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testTeardown();

                commandInstance = await CommandTestFactory.createTestingCommand({
                    imports: [CoscradCliModule],
                })
                    .overrideProvider(AppModule)
                    .useValue(testAppModule)
                    .overrideProvider(DynamicDataTypeModule)
                    .useValue(testAppModule.get(DynamicDataTypeModule))
                    .overrideProvider(ArangoDatabaseProvider)
                    .useValue(databaseProvider)
                    .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
                    .useValue(testRepositoryProvider)
                    .compile();
            });

            it(`should ingest the media items`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--directory=${buildDirectoryPath(`mediaItemsOnly`)}`,
                    `--staticAssetDestinationDirectory=${destinationDir}`,
                    `--createResources`,
                    `--publish`,
                    // TODO support tags
                    // `--tags="from system X, kid's songs"`,
                ]);

                const searchResult = await testRepositoryProvider
                    .forResource<MediaItem>(AggregateType.mediaItem)
                    .fetchMany();

                const mediaItems = searchResult
                    .filter(validAggregateOrThrow)
                    .filter(({ published }) => published);

                expect(mediaItems).toHaveLength(expectedNumberOfMediaItemsCreated);

                const testMp3FileName = `biodynamic-theme-song-forever`;

                const testMp3MediaItem = mediaItems.find((mediaItem) =>
                    mediaItem.getFilePath().toLowerCase().includes(testMp3FileName.toLowerCase())
                );

                expect(testMp3MediaItem).toBeInstanceOf(MediaItem);

                const { lengthMilliseconds } = testMp3MediaItem;

                const actualMediaItemLength = 8.35916 * 1000; // ms, determined with Audacity

                const lengthToCompare = isFiniteNumber(lengthMilliseconds)
                    ? lengthMilliseconds
                    : -1;

                expect(lengthToCompare).toBeCloseTo(actualMediaItemLength);

                const newAudioItems = (await testRepositoryProvider
                    .forResource(AggregateType.audioItem)
                    .fetchMany()) as AudioItem[];

                expect(newAudioItems.length).toBe(2);

                const newVideos = (await testRepositoryProvider
                    .forResource(AggregateType.video)
                    .fetchMany()) as Video[];

                expect(newVideos.length).toBe(2);

                const newPhotographs = (await testRepositoryProvider
                    .forResource(AggregateType.photograph)
                    .fetchMany()) as Photograph[];

                expect(newPhotographs.length).toBe(3);

                const newPngPhotograph = newPhotographs.find(
                    ({ title }) => title.getOriginalTextItem().text === 'station'
                );

                const expectedHeightPx = 1280;

                const expectedWidthPx = 960;

                expect(newPngPhotograph.dimensions.heightPx).toEqual(expectedHeightPx);

                expect(newPngPhotograph.dimensions.widthPx).toEqual(expectedWidthPx);
            }, 60000); // timeout of 60s
        });

        describe(`when publication of the media item is not requested`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testTeardown();

                commandInstance = await CommandTestFactory.createTestingCommand({
                    imports: [CoscradCliModule],
                })
                    .overrideProvider(AppModule)
                    .useValue(testAppModule)
                    .overrideProvider(DynamicDataTypeModule)
                    .useValue(testAppModule.get(DynamicDataTypeModule))
                    .overrideProvider(ArangoDatabaseProvider)
                    .useValue(databaseProvider)
                    .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
                    .useValue(testRepositoryProvider)
                    .compile();
            });

            it(`should not publish the media items`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--directory=${buildDirectoryPath(`mediaItemsOnly`)}`,
                    `--staticAssetDestinationDirectory=${destinationDir}`,
                    `--createResources`,
                    // `--publish`,
                ]);

                const searchResult = await testRepositoryProvider
                    .forResource<MediaItem>(AggregateType.mediaItem)
                    .fetchMany();

                const mediaItems = searchResult.filter(validAggregateOrThrow);

                expect(mediaItems).toHaveLength(expectedNumberOfMediaItemsCreated);

                const publicMediaItems = mediaItems.filter(({ published }) => published);

                expect(publicMediaItems).toHaveLength(0);
            }, 60000); // timeout of 60s
        });

        describe(`when associated resource creation is not requested`, () => {
            beforeEach(async () => {
                await testRepositoryProvider.testTeardown();

                commandInstance = await CommandTestFactory.createTestingCommand({
                    imports: [CoscradCliModule],
                })
                    .overrideProvider(AppModule)
                    .useValue(testAppModule)
                    .overrideProvider(DynamicDataTypeModule)
                    .useValue(testAppModule.get(DynamicDataTypeModule))
                    .overrideProvider(ArangoDatabaseProvider)
                    .useValue(databaseProvider)
                    .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
                    .useValue(testRepositoryProvider)
                    .compile();
            });

            it(`should not create associated resources`, async () => {
                testRepositoryProvider;

                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--directory=${buildDirectoryPath(`mediaItemsOnly`)}`,
                    `--staticAssetDestinationDirectory=${destinationDir}`,
                    // omitted
                    // `--createResources`,
                    `--publish`,
                ]);

                const searchResult = await testRepositoryProvider
                    .forResource<MediaItem>(AggregateType.mediaItem)
                    .fetchMany();

                const mediaItems = searchResult
                    .filter(validAggregateOrThrow)
                    .filter(({ published }) => published);

                expect(mediaItems).toHaveLength(expectedNumberOfMediaItemsCreated);

                const numberOfNewAudioItems = await testRepositoryProvider
                    .forResource(AggregateType.audioItem)
                    .getCount();

                expect(numberOfNewAudioItems).toBe(0);

                const numberOfNewVideos = await testRepositoryProvider
                    .forResource(AggregateType.video)
                    .getCount();

                expect(numberOfNewVideos).toBe(0);

                const numberOfNewPhotographs = await testRepositoryProvider
                    .forResource(AggregateType.photograph)
                    .getCount();

                expect(numberOfNewPhotographs).toBe(0);
            }, 6000); // timeout of 6 s
        });
    });

    /**
     * TODO[test coverage]:
     * - When the directory has nested directories
     * - when the directory has other file types
     *
     * Note that this is an internal tool and not user facing.
     */
});
