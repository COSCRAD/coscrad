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
import { AUDIO_QUERY_REPOSITORY_TOKEN } from '../../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { AudioAddedForDigitalTextPage } from '../../../digital-text/commands';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { TermCreated } from '../create-term';
import { TermTranslated } from '../translate-term';
import { AudioAddedForTerm } from './audio-added-for-term.event';
import { AudioAddedForTermEventHandler } from './audio-added-for-term.event-handler';

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

const audioItemId = buildDummyUuid(1);

const audioAddedForTerm = termTranslated.andThen<AudioAddedForDigitalTextPage>({
    type: 'AUDIO_ADDED_FOR_DIGITAL_TEXT_PAGE',
    payload: {
        audioItemId,
    },
});

const [creationEvent, translationEvent, audioAddedEvent] =
    audioAddedForTerm.as(termCompositeIdentifier);

const initialView = TermViewModel.fromTermCreated(creationEvent as TermCreated).apply(
    translationEvent
);

describe('AudioAddedForTermEventHandler.handle', () => {
    let testQueryRepository: ITermQueryRepository;

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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            app.get(AUDIO_QUERY_REPOSITORY_TOKEN),
            new ConsoleCoscradCliLogger()
        );

        audioAddedForTermEventHandler = new AudioAddedForTermEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        arangoDatabaseForCollection.clear();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(initialView);
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
            expect(updatedTerm.mediaItemId).toBe('fix-this-test');
        });
    });
});
