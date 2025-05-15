import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { IVideoQueryRepository } from '../../queries';
import { ArangoVideoQueryRepository } from '../../repositories/arango-video-query-repository';
import { VideoCreated } from './video-created.event';
import { VideoCreatedEventHandler } from './video-created.event-handler';

const videoId = buildDummyUuid(2);

const videoName = 'name of the video being created';

const languageCodeForName = LanguageCode.Chilcotin;

const videoCreated = buildTestInstance(VideoCreated, {
    payload: {
        aggregateCompositeIdentifier: { type: AggregateType.mediaItem, id: videoId },
        languageCodeForName,
        name: videoName,
    },
});

describe(`VideoCreatedEventHandler`, () => {
    let testQueryRepository: IVideoQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let videoCreatedEventHandler: VideoCreatedEventHandler;

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

        videoCreatedEventHandler = new VideoCreatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when creating a video`, () => {
        it(`should create the video`, async () => {
            await videoCreatedEventHandler.handle(videoCreated);

            const updatedView = await testQueryRepository.fetchById(videoId);

            expect(updatedView).not.toBe(NotFound);
        });
    });
});
