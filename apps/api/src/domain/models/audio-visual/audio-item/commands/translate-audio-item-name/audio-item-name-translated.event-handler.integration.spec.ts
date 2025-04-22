import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { buildMultilingualTextFromBilingualText } from '../../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../queries';
import { IAudioItemQueryRepository } from '../../queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../repositories/arango-audio-item-query-repository';
import { AudioItemNameTranslated } from './audio-item-name-translated-event';
import { AudioItemNameTranslatedEventHandler } from './audio-item-name-translated.event-handler';

const audioItemId = buildDummyUuid(12);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'name in English';

const translationEvent = buildTestInstance(AudioItemNameTranslated, {
    type: 'AUDIO_ITEM_NAME_TRANSLATED',
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.audioItem,
            id: audioItemId,
        },
        text: translationText,
        languageCode: translationLanguageCode,
    },
});

const existingView = buildTestInstance(EventSourcedAudioItemViewModel, {
    name: buildMultilingualTextFromBilingualText(
        { text: 'name in language', languageCode: originalLanguageCode },
        { text: translationText, languageCode: translationLanguageCode }
    ),
});

describe(`AudioItemNameTranslatedEventHandler`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let audioItemNameTranslatedEventHandler: AudioItemNameTranslatedEventHandler;

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

        testQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        audioItemNameTranslatedEventHandler = new AudioItemNameTranslatedEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing audio item`, () => {
        it(`should translate the given audio item name`, async () => {
            await audioItemNameTranslatedEventHandler.handle(translationEvent);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as EventSourcedAudioItemViewModel;

            const translationItemSearchResult = new MultilingualText(
                updatedView.name
            ).getTranslation(translationLanguageCode);

            expect(translationItemSearchResult).not.toBe(NotFound);

            const { text: foundText, role: foundRole } =
                translationItemSearchResult as MultilingualTextItem;

            expect(foundText).toBe(translationText);

            expect(foundRole).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });
});
