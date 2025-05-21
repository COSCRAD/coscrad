import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from './arango-song-query-repository';

const existingSong = buildTestInstance(EventSourcedSongViewModel);

describe(`ArangoSongQueryRepository`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

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
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('song__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        describe(`when there is a song with the given ID`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(existingSong);
            });

            it('should find an existing song', async () => {
                const searchResult = await testQueryRepository.fetchById(existingSong.id);

                expect(searchResult).not.toBe(NotFound);

                const updatedSong = searchResult as EventSourcedSongViewModel;

                expect(updatedSong.name.toString()).toEqual(existingSong.name.toString());
            });
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany();
        });
    });
});
