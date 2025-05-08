import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { PlaylistViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ArangoPlaylistQueryRepository } from '../../queries/arango-playlist-query-repository';
import { IPlaylistQueryRepository } from '../../queries/playlist-query-repository.interface';
import { AudioItemsImportedToPlaylist } from './audio-items-imported-to-playlist.event';
import { AudioItemsImportedToPlaylistEventHandler } from './audio-items-imported-to-playlist.event-handler';

const audioItemIds = [23, 34, 45].map(buildDummyUuid);

const existingAudioItems = audioItemIds.map((id) =>
    buildTestInstance(EventSourcedAudioItemViewModel, {
        id,
    })
);

const existingPlaylistView = buildTestInstance(PlaylistViewModel, {
    episodes: [],
});

const audioItemsImported = buildTestInstance(AudioItemsImportedToPlaylist, {
    payload: {
        aggregateCompositeIdentifier: {
            id: existingPlaylistView.id,
        },
        audioItemIds,
    },
});

describe(`AudioItemsImportedToPlaylistEventHandler`, () => {
    let testQueryRepository: IPlaylistQueryRepository;

    let audioQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let audioItemsImportedToPlaylistEventHandler: AudioItemsImportedToPlaylistEventHandler;

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

        audioQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        audioItemsImportedToPlaylistEventHandler = new AudioItemsImportedToPlaylistEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingPlaylistView);

        await audioQueryRepository.createMany(existingAudioItems);
    });

    describe(`when there is a playlist with no episodes`, () => {
        it(`should import the audio items as episodes`, async () => {
            await audioItemsImportedToPlaylistEventHandler.handle(audioItemsImported);

            const updatedView = (await testQueryRepository.fetchById(
                existingPlaylistView.id
            )) as PlaylistViewModel;

            expect(updatedView.episodes).toHaveLength(audioItemIds.length);
        });
    });
});
