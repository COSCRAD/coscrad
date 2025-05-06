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
import { PlaylistViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoPlaylistQueryRepository } from '../../queries/arango-playlist-query-repository';
import { IPlaylistQueryRepository } from '../../queries/playlist-query-repository.interface';
import { PlaylistNameTranslated } from './playlist-name-translated.event';
import { PlaylistNameTranslatedEventHandler } from './playlist-name-translated.event-handler';

const originalLanguageCode = LanguageCode.Chilcotin;

const playlistId = buildDummyUuid(12);

const translationLanguageCode = LanguageCode.English;

const translationText = 'text of the translated';

const existingPlaylistView = buildTestInstance(PlaylistViewModel, {
    id: playlistId,
    name: buildMultilingualTextWithSingleItem('playlist name', originalLanguageCode),
});

const playlistNameTranslated = buildTestInstance(PlaylistNameTranslated, {
    payload: {
        aggregateCompositeIdentifier: { id: playlistId },
        languageCode: translationLanguageCode,
        text: translationText,
    },
});

describe(`PlaylistNameTranslatedEventHandler`, () => {
    let testQueryRepository: IPlaylistQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let playlistNameTranslatedEventHandler: PlaylistNameTranslatedEventHandler;

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

        testQueryRepository = new ArangoPlaylistQueryRepository(connectionProvider);

        playlistNameTranslatedEventHandler = new PlaylistNameTranslatedEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(existingPlaylistView);
    });

    describe(`when there is a playlist with no translation for its name`, () => {
        it(`should translate the playlist name`, async () => {
            await playlistNameTranslatedEventHandler.handle(playlistNameTranslated);

            const updatedView = (await testQueryRepository.fetchById(
                playlistId
            )) as PlaylistViewModel;

            expect(updatedView.name.has(translationLanguageCode)).toBe(true);
        });
    });
});
