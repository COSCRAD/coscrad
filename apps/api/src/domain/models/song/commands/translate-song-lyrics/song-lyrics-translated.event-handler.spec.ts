import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ISongQueryRepository } from '../../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from '../../repositories/arango-song-query-repository';
import { SongLyricsTranslated } from './song-lyrics-translated.event';
import { SongLyricsTranslatedEventHandler } from './song-lyrics-translated.event-handler';

const songId = buildDummyUuid(12);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationOfSong = 'lyrics for a song translated';

const existingSongView = buildTestInstance(EventSourcedSongViewModel, {
    id: songId,
    name: buildMultilingualTextWithSingleItem('song lyrics', originalLanguageCode),
});

const songLyricsTranslated = buildTestInstance(SongLyricsTranslated, {
    payload: {
        aggregateCompositeIdentifier: {
            id: songId,
        },
        languageCode: translationLanguageCode,
        translation: translationOfSong,
    },
});

describe(`SongLyricsTranslatedEventHandler`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let songLyricsTranslatedEventHandler: SongLyricsTranslatedEventHandler;

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

        songLyricsTranslatedEventHandler = new SongLyricsTranslatedEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingSongView);
    });

    describe(`when there is a song with no translation for lyrics`, () => {
        it(`should translate the song lyrics`, async () => {
            await songLyricsTranslatedEventHandler.handle(songLyricsTranslated);

            const updatedView = (await testQueryRepository.fetchById(
                songId
            )) as EventSourcedSongViewModel;

            expect(updatedView.lyrics.has(translationLanguageCode)).toBe(true);
        });
    });
});
