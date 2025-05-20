import { LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedVideoViewModel, IVideoQueryRepository } from '../../queries';
import { ArangoVideoQueryRepository } from '../../repositories/arango-video-query-repository';
import { VideoNameTranslated } from './video-name-translated.event';
import { VideoNameTranslatedEventHandler } from './video-name-translated.event-handler';

const videoItemId = buildDummyUuid(11);

const name = 'video name';

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationOfname = 'name that was translated';

const existingVideoView = buildTestInstance(EventSourcedVideoViewModel, {
    id: videoItemId,
    name: buildMultilingualTextWithSingleItem(name, originalLanguageCode),
});

const videoNameTranslated = buildTestInstance(VideoNameTranslated, {
    payload: {
        aggregateCompositeIdentifier: { id: videoItemId },
        text: translationOfname,
        languageCode: translationLanguageCode,
    },
});

describe(`VideoNameTranslatedEventHandler`, () => {
    let testQueryRepository: IVideoQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let videoNameTranslatedEventHandler: VideoNameTranslatedEventHandler;

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

        videoNameTranslatedEventHandler = new VideoNameTranslatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingVideoView);
    });

    describe(`when there is a video with an existing name`, () => {
        it(`should translate the name`, async () => {
            await videoNameTranslatedEventHandler.handle(videoNameTranslated);

            const updatedView = (await testQueryRepository.fetchById(
                videoItemId
            )) as EventSourcedVideoViewModel;

            expect(updatedView.name.has(translationLanguageCode)).toBe(true);
        });
    });
});
