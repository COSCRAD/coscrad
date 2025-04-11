import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../app/controllers/command/services/command-info-service';
import { PlaylistModule } from '../../../../app/domain-modules/playlist.module';
import { NotFound } from '../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { buildTestInstance } from '../../../../test-data/utilities';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { IPlaylistQueryRepository, PLAYLIST_QUERY_REPOSITORY_TOKEN } from '../queries';
import { PlaylistCreated } from './playlist-created.event';
import { PlaylistCreatedEventHandler } from './playlist-created.event-handler';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const playlistNameText = 'Hot Jams';

const originalLanguageCode = LanguageCode.English;

const playlistId = buildDummyUuid(909);

const playlistCreatedEvent = buildTestInstance(PlaylistCreated, {
    payload: {
        name: playlistNameText,
        languageCodeForName: originalLanguageCode,
        aggregateCompositeIdentifier: {
            id: playlistId,
        },
    },
});

describe(`PlaylistCreatedEventHandler`, () => {
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
                        // validate,
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

            await app
                .get<IRepositoryProvider>(REPOSITORY_PROVIDER_TOKEN)
                .getContributorRepository()
                .create(dummyContributor);
        });

        it(`should create the expected view in the database`, async () => {
            const handler = app.get(PlaylistCreatedEventHandler);

            await handler.handle(playlistCreatedEvent);

            const searchResult = await testQueryRepository.fetchById(playlistId);

            expect(searchResult).not.toBe(NotFound);

            const { name } = searchResult as PlaylistViewModel;

            const { languageCode: foundLanguageCode, text: foundText } = name.getOriginalTextItem();

            expect(foundLanguageCode).toBe(originalLanguageCode);

            expect(foundText).toBe(playlistNameText);
        });
    });
});
