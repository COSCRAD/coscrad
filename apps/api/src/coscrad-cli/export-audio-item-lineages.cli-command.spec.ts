import { MIMEType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/environment';
import { EdgeConnectionModule } from '../app/domain-modules/edge-connection.module';
import getValidAggregateInstanceForTest from '../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory, EventModule } from '../domain/common';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { AudioVisualModule } from '../domain/models/audio-visual/application/audio-visual.module';
import { AudioItemCreated } from '../domain/models/audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { MediaItem } from '../domain/models/media-item/entities/media-item.entity';
import { ResourcePublished } from '../domain/models/shared/common-commands/publish-resource/resource-published.event';
import idEquals from '../domain/models/shared/functional/idEquals';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../persistence/repositories/arango-event-repository';
import { TestEventStream } from '../test-data/events';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'audio-lineages';

const outputDir = `__cli-command-test-files__`;

const buildOutputFilepath = (filename: string) => `${outputDir}/${filename}`;

const mockLogger = buildMockLogger({ isEnabled: true });

const dummyMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem);

const buildMediaItem = (audioItemId: AggregateId, mediaItemId: AggregateId): MediaItem =>
    dummyMediaItem.clone({
        id: mediaItemId,
        title: `media item for: ${audioItemId}`,
        mimeType: MIMEType.wav,
    });

const buildAudioItem = (sequenceNumber: number, mediaItemId: AggregateId): AudioItem => {
    const events = new TestEventStream()
        .andThen<AudioItemCreated>({
            type: 'AUDIO_ITEM_CREATED',
            payload: {
                name: `Audio item # ${sequenceNumber}`,
                mediaItemId,
            },
        })
        .andThen<ResourcePublished>({
            type: 'RESOURCE_PUBLISHED',
        });

    const audioId = buildDummyUuid(sequenceNumber);

    return AudioItem.fromEventHistory(
        events.as({ type: 'audioItem', id: audioId }),
        audioId
    ) as AudioItem;
};

const numberOfAudioItems = 10;

const mediaItemIds = Array(numberOfAudioItems)
    .fill(null)
    .map((_, audioSequenceNumber) => buildDummyUuid(audioSequenceNumber + 100));

const audioItems = Array(numberOfAudioItems)
    .fill(null)
    .map((_, index) => buildAudioItem(index, mediaItemIds[index]));

const mediaItems = mediaItemIds.map((mediaItemId, index) =>
    buildMediaItem(audioItems[index].id, mediaItemId)
);

describe(`CLI Command: **${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let testAppModule: TestingModule;

    let testEventRepository: ArangoEventRepository;

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
            providers: [AudioItem, ResourcePublished, AudioItemCreated].map((Ctor) => ({
                provide: Ctor,
                useValue: Ctor,
            })),
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

        testEventRepository = new ArangoEventRepository(
            databaseProvider,
            testAppModule.get(CoscradEventFactory)
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

    describe(`when the request is valid`, () => {
        beforeEach(async () => {
            await testEventRepository.appendEvents(
                audioItems.flatMap(({ eventHistory }) => eventHistory || [])
            );

            await testRepositoryProvider.addFullSnapshot(
                new DeluxeInMemoryStore({
                    resources: {
                        mediaItem: mediaItems,
                    },
                }).fetchFullSnapshotInLegacyFormat()
            );
        });

        it(`should write the correct result`, async () => {
            // Note that we start indexing at 1 (human readable)
            const outputFilename = `export-audio-item-lineages.cli-command.valid-case.data.json`;

            const outputFilepath = buildOutputFilepath(outputFilename);

            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--filepath=${outputFilepath}`,
            ]);

            const fileExists = existsSync(outputFilepath);

            expect(fileExists).toBe(true);

            const raw = readFileSync(outputFilepath);

            const contents = JSON.parse(raw.toString());

            expect(contents.length).toBe(audioItems.length);

            const invalidItems = contents.filter(({ audioItemId, filename }) => {
                const index = audioItems.findIndex(idEquals(audioItemId));

                if (index === -1) {
                    return true;
                }

                const mediaItem = mediaItems[index];

                // note we keep the invalid ones
                return mediaItem.getName().getOriginalTextItem().text !== filename;
            });

            expect(invalidItems).toEqual([]);
        });
    });

    describe(`when the request is invalid`, () => {
        describe(`when the required parameter (filepath) is missing`, () => {
            // TODO finish this test case
            it.skip(`should fail, logging the expected error`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    // `--filepath=${outputFilepath}`, missing
                ]);
            });
        });
    });
});
