import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextFromBilingualText } from '../../../../../domain/common/build-multilingual-text-from-bilingual-text';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ISongQueryRepository } from '../../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from '../../repositories/arango-song-query-repository';
import { SongTitleTranslated } from './song-title-translated.event';
import { SongTitleTranslatedEventHandler } from './song-title-translated.event-handler';

const audioItemId = buildDummyUuid(123);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'song title of translated';

const translationEvent = buildTestInstance(SongTitleTranslated, {
    type: 'SONG_TITLE_TRANSLATED',
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.song,
            id: audioItemId,
        },
        translation: translationText,
        languageCode: translationLanguageCode,
    },
});

const existingView = buildTestInstance(EventSourcedSongViewModel, {
    name: buildMultilingualTextFromBilingualText(
        { text: 'title in language', languageCode: originalLanguageCode },
        { text: translationText, languageCode: translationLanguageCode }
    ),
});

describe(`SongTitleTranslatedEventHandler`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let songTitleTranslatedEventHandler: SongTitleTranslatedEventHandler;

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

        songTitleTranslatedEventHandler = new SongTitleTranslatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing song`, () => {
        it(`should translate the given song title`, async () => {
            await songTitleTranslatedEventHandler.handle(translationEvent);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as EventSourcedSongViewModel;

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
