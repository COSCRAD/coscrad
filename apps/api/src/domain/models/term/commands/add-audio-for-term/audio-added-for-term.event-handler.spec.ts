import { AggregateType, IDetailQueryResult, ITermViewModel } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { EventSourcedAudioItemViewModel } from '../../../audio-visual/audio-item/queries';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { TermCreated } from '../create-term';
import { TermTranslated } from '../translate-term';
import { AudioAddedForTerm } from './audio-added-for-term.event';
import { AudioAddedForTermEventHandler } from './audio-added-for-term.event-handler';

const audioItemId = buildDummyUuid(88);

const audioItemCompositeId = {
    type: AggregateType.audioItem,
    id: audioItemId,
};

const termId = buildDummyUuid(1);

const termCompositeIdentifier = {
    type: AggregateType.term,
    id: termId,
};

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
});

const termTranslated = termCreated.andThen<TermTranslated>({
    type: 'TERM_TRANSLATED',
});

const audioAddedForTerm = termTranslated.andThen<AudioAddedForTerm>({
    type: 'AUDIO_ADDED_FOR_TERM',
    payload: {
        audioItemId,
    },
});

const [creationEvent, translationEvent, audioAddedEvent] =
    audioAddedForTerm.as(termCompositeIdentifier);

const initialView = TermViewModel.fromTermCreated(creationEvent as TermCreated).apply(
    translationEvent
);

const mediaItemId = buildDummyUuid(77);

const [audioItemCreated] = new TestEventStream()
    .andThen<AudioItemCreated>({
        type: 'AUDIO_ITEM_CREATED',
        payload: {
            mediaItemId,
        },
    })
    .as(audioItemCompositeId) as [AudioItemCreated];

const relatedAudioItem = EventSourcedAudioItemViewModel.fromAudioItemCreated(audioItemCreated);

describe('AudioAddedForTermEventHandler.handle', () => {
    let testQueryRepository: ITermQueryRepository;

    let audioRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

    let app: INestApplication;

    let audioAddedForTermEventHandler: AudioAddedForTermEventHandler;

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

        arangoDatabaseForCollection = databaseProvider.getDatabaseForCollection('term__VIEWS');

        audioRepository = app.get(AUDIO_QUERY_REPOSITORY_TOKEN);

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            audioRepository,
            new ConsoleCoscradCliLogger()
        );

        audioAddedForTermEventHandler = new AudioAddedForTermEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await arangoDatabaseForCollection.clear();

        await databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(initialView);

        await audioRepository.create(relatedAudioItem);

        console.log('done');
    });

    describe(`when there is an existing term`, () => {
        it(`should update the database appropriately`, async () => {
            await audioAddedForTermEventHandler.handle(audioAddedEvent as AudioAddedForTerm);

            const result = await testQueryRepository.fetchById(termId);

            // Do we want to return instances?
            // expect(result).toBeInstanceOf(TermViewModel);

            expect(result).not.toBe(NotFound);

            const updatedTerm = result as TermViewModel;

            /**
             * We need to ensure that the media item ID comes through
             * the eager joins.
             */
            expect(updatedTerm.mediaItemId).toBe(audioItemId);
        });
    });
});
