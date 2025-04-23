import { AggregateType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { PlaylistModule } from '../../../../../app/domain-modules/playlist.module';
import { NotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { PlaylistViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../../audio-visual/audio-item/queries';
import {
    IPlaylistQueryRepository,
    PLAYLIST_QUERY_REPOSITORY_TOKEN,
} from '../../queries/playlist-query-repository.interface';
import { AudioItemAddedToPlaylist } from './audio-item-added-to-playlist.event';
import { AudioItemAddedToPlaylistEventHandler } from './audio-item-added-to-playlist.event-handler';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const playlistId = buildDummyUuid(909);

const audioItemId = buildDummyUuid(999);

const existingAudioItemView = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemId,
});

const audioItemAddedToPlaylistEvent = buildTestInstance(AudioItemAddedToPlaylist, {
    payload: {
        aggregateCompositeIdentifier: {
            id: playlistId,
        },
        audioItemId: existingAudioItemView.id,
    },
});

const existingPlaylist = buildTestInstance(PlaylistViewModel, {
    id: playlistId,
    episodes: [],
});

describe(`AudioItemAddedToPlaylistEventHandler`, () => {
    describe(`when handling a PLAYLIST_CREATED event`, () => {
        let testQueryRepository: IPlaylistQueryRepository;

        let databaseProvider: ArangoDatabaseProvider;

        let app: INestApplication;

        beforeAll(async () => {
            const moduleRef = await Test.createTestingModule({
                providers: [CommandInfoService],
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        envFilePath: buildConfigFilePath(Environment.test),
                        cache: false,
                    }),
                    PersistenceModule.forRootAsync(),
                    CommandModule,
                    PlaylistModule,
                ],
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

            await app.init();

            databaseProvider = app.get(ArangoDatabaseProvider);

            testQueryRepository = app.get(PLAYLIST_QUERY_REPOSITORY_TOKEN);
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.contributors)
                .clear();

            await databaseProvider
                .getDatabaseForCollection('audioItem__VIEWS')
                .create(mapEntityDTOToDatabaseDocument(existingAudioItemView));

            await testQueryRepository.create(existingPlaylist);

            await app
                .get<IRepositoryProvider>(REPOSITORY_PROVIDER_TOKEN)
                .getContributorRepository()
                .create(dummyContributor);
        });

        it(`should append the correct episode to the existing playlist in the query db`, async () => {
            const handler = app.get(AudioItemAddedToPlaylistEventHandler);

            await handler.handle(audioItemAddedToPlaylistEvent);

            const searchResult = await testQueryRepository.fetchById(playlistId);

            expect(searchResult).not.toBe(NotFound);

            const { episodes } = searchResult as PlaylistViewModel;

            expect(episodes).toHaveLength(1);

            const { name, mediaItemId } = episodes[0];

            expect(name).toEqual(existingAudioItemView.name);

            expect(mediaItemId).toEqual(existingAudioItemView.mediaItemId);
        });
    });
});
