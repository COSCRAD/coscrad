import { AggregateType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../../../app/config/constants/environment';
import buildDummyUuid from '../../../../../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoConnectionProvider } from '../../../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../../../test-data/utilities';
import { EventSourcedAudioItemViewModel } from '../../../../audio-item/queries';
import { IAudioItemQueryRepository } from '../../../../audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../../../audio-item/repositories/arango-audio-item-query-repository';
import { TranscriptCreated } from './transcript-created.event';
import { TranscriptCreatedEventHandler } from './transcript-created.event-handler';

const audioItemId = buildDummyUuid(543);

const transcriptCreated = buildTestInstance(TranscriptCreated, {
    payload: {
        aggregateCompositeIdentifier: { type: AggregateType.audioItem, id: audioItemId },
    },
});

const targetAudioItem = buildTestInstance(EventSourcedAudioItemViewModel, {
    id: audioItemId,
    transcript: null,
});

describe(`TranscriptCreatedEventHandler.handle`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let transcriptCreatedEventHandler: TranscriptCreatedEventHandler;

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

        transcriptCreatedEventHandler = new TranscriptCreatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(targetAudioItem);
    });

    it(`should create an empty transcript`, async () => {
        await transcriptCreatedEventHandler.handle(transcriptCreated);

        const { transcript } = (await testQueryRepository.fetchById(
            audioItemId
        )) as EventSourcedAudioItemViewModel;

        expect(transcript).toBeTruthy();
    });
});
