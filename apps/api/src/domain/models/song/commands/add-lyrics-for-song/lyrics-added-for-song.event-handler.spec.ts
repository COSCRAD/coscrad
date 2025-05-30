import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ISongQueryRepository } from '../../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from '../../repositories/arango-song-query-repository';
import { LyricsAddedForSong } from './lyrics-added-for-song.event';
import { LyricsAddedForSongEventHandler } from './lyrics-added-for-song.event-handler';

const songId = buildDummyUuid(1);

const lyrics = 'lyrics of song';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const lyricsAddedForSong = new TestEventStream().buildSingle<LyricsAddedForSong>({
    type: 'LYRICS_ADDED_FOR_SONG',
    meta: {
        contributorIds: [dummyContributor.id],
    },
    payload: {
        aggregateCompositeIdentifier: { id: songId },
        lyrics,
        languageCode: LanguageCode.English,
    },
});

const existingView = buildTestInstance(EventSourcedSongViewModel, {
    id: songId,
});

describe(`LyricsAddedForSongEventHandler`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let lyricsAddedForSongEventHandler: LyricsAddedForSongEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoSongQueryRepository(connectionProvider);

        lyricsAddedForSongEventHandler = new LyricsAddedForSongEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);
    });

    describe(`when handling lyrics added for song`, () => {
        it('should add the lyrics', async () => {
            await lyricsAddedForSongEventHandler.handle(lyricsAddedForSong);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as EventSourcedSongViewModel;

            expect(updatedView.lyrics).toBeTruthy();
        });
    });
});
