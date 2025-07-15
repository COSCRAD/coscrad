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
import { DigitalTextViewModel } from '../../../../../queries/digital-text';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../queries/digital-text-query-repository.interface';
import { AudioAddedForDigitalTextTitle } from './audio-added-for-digital-text-title.event';
import { AudioAddedForDigitalTextTitleEventHandler } from './audio-added-for-digital-text-title.event-handler';

const digitalTextId = buildDummyUuid(4);

const audioItemId = buildDummyUuid(3);

const languageCodeForTitle = LanguageCode.Chilcotin;

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    audioForTitle: null,
    name: buildMultilingualTextWithSingleItem('existing title', languageCodeForTitle),
});

const audioAdded = buildTestInstance(AudioAddedForDigitalTextTitle, {
    payload: {
        aggregateCompositeIdentifier: {
            id: digitalTextId,
        },
        audioItemId,
        languageCode: languageCodeForTitle,
    },
});

describe(`AudioAddedForDigitalTextTitle`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let audioRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let audioAddedForDigitalTextTitleEventHandler: AudioAddedForDigitalTextTitleEventHandler;

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

        testQueryRepository = new ArangoDigitalTextQueryRepository(connectionProvider);

        audioRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        audioAddedForDigitalTextTitleEventHandler = new AudioAddedForDigitalTextTitleEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingDigitalTextView);

        await audioRepository.create(
            buildTestInstance(EventSourcedAudioItemViewModel, {
                id: audioItemId,
            })
        );
    });

    describe(`when audio is added to the digital text title`, () => {
        it(`should add the audio to the title`, async () => {
            await audioAddedForDigitalTextTitleEventHandler.handle(audioAdded);

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            const audioSearchResult =
                updatedView.audioForTitle.getIdForAudioIn(languageCodeForTitle);

            expect(audioSearchResult).toBe(audioItemId);
        });
    });
});
