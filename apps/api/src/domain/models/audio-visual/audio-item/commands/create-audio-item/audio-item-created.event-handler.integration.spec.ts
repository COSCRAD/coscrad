import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../app/config/constants/environment';
import { MultilingualText } from '../../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../../test-data/events';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { EventSourcedAudioItemViewModel } from '../../queries';
import { IAudioItemQueryRepository } from '../../queries/audio-item-query-repository.interface';
import { AudioItemCreated } from './audio-item-created.event';
import { AudioItemCreatedEventHandler } from './audio-item-created.event-handler';

const audioItemId = buildDummyUuid(1);

const audioItemName = 'good song';

const languageCodeForName = LanguageCode.Chilcotin;

const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
    type: 'AUDIO_ITEM_CREATED',
    payload: {
        name: audioItemName,
        languageCodeForName,
    },
});

const targetEvent = audioItemCreated.as({
    type: AggregateType.audioItem,
    id: audioItemId,
})[0] as AudioItemCreated;

describe(`AudioItemCreatedEventHandler`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

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

        testQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when handling an AUDIO_ITEM_CREATED event`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();
        });

        it(`should succeed`, async () => {
            const handler = new AudioItemCreatedEventHandler(testQueryRepository);

            await handler.handle(targetEvent);

            const searchResult = await testQueryRepository.fetchById(audioItemId);

            expect(searchResult).not.toBe(NotFound);

            const foundView = searchResult as EventSourcedAudioItemViewModel;

            const name = new MultilingualText(foundView.name);

            const { languageCode: foundLanguageCode, text: foundText } = name.getOriginalTextItem();

            expect(foundLanguageCode).toBe(languageCodeForName);

            expect(foundText).toBe(audioItemName);
        });
    });
});
