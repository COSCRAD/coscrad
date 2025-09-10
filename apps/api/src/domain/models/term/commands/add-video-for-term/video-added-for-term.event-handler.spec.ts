import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { TermModule } from '../../../../../app/domain-modules/term.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import {
    EventSourcedVideoViewModel,
    IVideoQueryRepository,
    VIDEO_QUERY_REPOSITORY_TOKEN,
} from '../../../audio-visual/video/queries';
import { ArangoVideoQueryRepository } from '../../../audio-visual/video/repositories/arango-video-query-repository';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories';
import { VideoAddedForTerm } from './video-added-for-term.event';
import { VideoAddedForTermEventHandler } from './video-added-for-term.event-handler';

const termId = buildDummyUuid(67);

const videoId = buildDummyUuid(76);

const existingTermView = buildTestInstance(TermViewModel, {
    id: termId,
    mediaItemIdForVideo: videoId,
});

const videoAddedForTerm = buildTestInstance(VideoAddedForTerm, {
    payload: {
        aggregateCompositeIdentifier: { id: termId },
        videoId,
    },
});

describe(`VideoAddedForTermEventHandler`, () => {
    describe(`when handling a VIDEO_ADDED_FOR_TERM event`, () => {
        let testQueryRepository: ITermQueryRepository;

        let videoRepository: IVideoQueryRepository;

        let databaseProvider: ArangoDatabaseProvider;

        let app: INestApplication;

        let videoAddedForTermEventHandler: VideoAddedForTermEventHandler;

        beforeAll(async () => {
            const moduleRef = await Test.createTestingModule({
                imports: [PersistenceModule.forRootAsync(), TermModule],
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

            videoRepository = new ArangoVideoQueryRepository(connectionProvider);

            videoRepository = app.get(VIDEO_QUERY_REPOSITORY_TOKEN);

            testQueryRepository = new ArangoTermQueryRepository(
                connectionProvider,
                new ConsoleCoscradCliLogger()
            );

            videoAddedForTermEventHandler = app.get(VideoAddedForTermEventHandler);
        });

        afterAll(async () => {
            databaseProvider.close();
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(existingTermView);

            await videoRepository.create(
                buildTestInstance(EventSourcedVideoViewModel, {
                    id: videoId,
                })
            );
        });

        describe(`when there is an existing term`, () => {
            it(`should update the database appropriately`, async () => {
                await videoAddedForTermEventHandler.handle(videoAddedForTerm as VideoAddedForTerm);

                const { mediaItemIdForVideo } = (await testQueryRepository.fetchById(
                    existingTermView.id
                )) as TermViewModel;

                expect(mediaItemIdForVideo).toBe(videoId);
            });
        });
    });
});
