import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../queries';
import { ArangoVideoQueryRepository } from './arango-video-query-repository';

const targetVideo = buildTestInstance(EventSourcedVideoViewModel, {});

describe(`ArangoVideoQueryRepository`, () => {
    let testQueryRepository: IVideoQueryRepository;

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

        testQueryRepository = new ArangoVideoQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        // is this preferred to `databaseProvider.clearViews()` ?
        await databaseProvider.getDatabaseForCollection('video__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        describe(`when the video exists`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(targetVideo);
            });

            it(`should return the video`, async () => {
                const searchResult = await testQueryRepository.fetchById(targetVideo.id);

                expect(searchResult).not.toBe(NotFound);
                // TODO add more assertions
            });
        });

        describe(`when the video does not exist`, () => {
            it.todo(`should have a test`);
        });
    });
});
