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
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { ArangoDigitalTextQueryRepository } from '../../queries/arango-digital-text-query-repository';
import { IDigitalTextQueryRepository } from '../../queries/digital-text-query-repository.interface';
import { AudioAddedForDigitalTextPage } from './audio-added-for-digital-text-page.event';
import { AudioAddedForDigitalTextPageEventHandler } from './audio-added-for-digital-text-page.event-handler';

const digitalTextId = buildDummyUuid(45);

const audioItemId = buildDummyUuid(54);

const pageIdentifier = 'XLV';

const languageCodeForPage = LanguageCode.Chilcotin;

const existingDigitalTextView = buildTestInstance(DigitalTextViewModel, {
    id: digitalTextId,
    pages: [
        {
            identifier: pageIdentifier,
            content: buildMultilingualTextWithSingleItem(
                'existing text for page',
                languageCodeForPage
            ),
            audio: MultilingualAudio.buildEmpty(),
        },
    ],
});

const audioAddedForDigitalTextPage = buildTestInstance(AudioAddedForDigitalTextPage, {
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
        pageIdentifier,
        audioItemId,
        languageCode: languageCodeForPage,
    },
});

describe(`AudioAddedForDigitalTextPage`, () => {
    let testQueryRepository: IDigitalTextQueryRepository;

    let audioRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let audioAddedForDigitalTextPageEventHandler: AudioAddedForDigitalTextPageEventHandler;

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

        audioAddedForDigitalTextPageEventHandler = new AudioAddedForDigitalTextPageEventHandler(
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

    describe(`when audio is added to the digital text page`, () => {
        it(`should add the audio to the digital text page`, async () => {
            await audioAddedForDigitalTextPageEventHandler.handle(audioAddedForDigitalTextPage);

            const updatedView = (await testQueryRepository.fetchById(
                digitalTextId
            )) as DigitalTextViewModel;

            const pageSearchResult = updatedView.pages.find(
                ({ identifier }) => identifier === pageIdentifier
            );

            expect(pageSearchResult.audio.hasAudioIn(languageCodeForPage)).toBe(true);

            expect(pageSearchResult.audio.getIdForAudioIn(languageCodeForPage)).toBe(audioItemId);
        });
    });
});
