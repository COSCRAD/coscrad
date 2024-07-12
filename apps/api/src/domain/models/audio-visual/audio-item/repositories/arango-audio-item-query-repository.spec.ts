import { AggregateType, IAudioItemViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../commands/create-audio-item/transcript-created.event';
import { EventSourcedAudioItemViewModel } from '../queries';
import { IAudioItemQueryRepository } from '../queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from './arango-audio-item-query-repository';

const audioItemId = buildDummyUuid(1);

const compositeId = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

describe(`ArangoAudioItemQueryRepository`, () => {
    let testQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<IAudioItemViewModel>
    >;

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
                        // TODO this shouldn't be necessary
                        ARANGO_DB_HOST_PORT: 8551,
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        arangoDatabaseForCollection = databaseProvider.getDatabaseForCollection('term__VIEWS');

        testQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await arangoDatabaseForCollection.clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const audioItemCreated = new TestEventStream().andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
    });

    const [creationEvent] = audioItemCreated.as(compositeId) as [AudioItemCreated];

    describe(`ArangoAudioItemQueryRepository.fetchById`, () => {
        describe(`when there is an audio item with the given ID`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(
                    EventSourcedAudioItemViewModel.fromAudioItemCreated(creationEvent)
                );
            });

            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(audioItemId);

                expect(result).not.toBe(NotFound);
            });
        });

        describe(`when there is no audio item with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('bogusID');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`ArangoAudioItemQueryRepository.fetchMany`, () => {
        it.todo(`should have a test`);
    });

    describe(`ArangoAudioItemQueryRepository.count`, () => {
        it.todo(`should have a test`);
    });

    describe(`ArangoAudioItemQueryRepository.create`, () => {
        it.todo(`should have a test`);
    });

    describe(`ArangoAudioItemQueryRepository.delete`, () => {
        it.todo(`should have a test`);
    });

    describe(`ArangoAudioItemQueryRepository.translateName`, () => {
        it.todo(`should have a test`);
    });
});
