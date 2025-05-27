import { AggregateType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../app/controllers/command/services/command-info-service';
import { SongModule } from '../../../../app/domain-modules/song.module';
import { NotFound } from '../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { ArangoSongQueryRepository } from '../repositories/arango-song-query-repository';
import { SongCreated } from './song-created.event';
import { SongCreatedEventHandler } from './song-created.event-handler';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const songCreated = new TestEventStream().buildSingle<SongCreated>({
    type: 'SONG_CREATED',
    meta: {
        contributorIds: [dummyContributor.id],
    },
    payload: {},
});

describe(`SongCreatedEventHandler`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, SongCreatedEventHandler],
            imports: [PersistenceModule.forRootAsync(), CommandModule, SongModule],
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

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoSongQueryRepository(
            connectionProvider
            // new ConsoleCoscradCliLogger()
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when handling a song created`, () => {
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

        it(`should create the song`, async () => {
            await app.get(SongCreatedEventHandler).handle(songCreated);

            const searchResult = await testQueryRepository.fetchById(
                songCreated.payload.aggregateCompositeIdentifier.id
            );

            expect(searchResult).not.toBe(NotFound);
        });
    });
});
