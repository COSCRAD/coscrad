import {
    AggregateType,
    IDetailQueryResult,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound, NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { TermCreated } from '../create-term';
import { TermTranslated } from './term-translated.event';
import { TermTranslatedEventHandler } from './term-translated.event-handler';

const termId = buildDummyUuid(1);

const compositeId = {
    type: AggregateType.digitalText,
    id: termId,
};

const originalLanguageCode = LanguageCode.Chilcotin;

const originalText = 'the term in the language';

const translationLanguageCode = LanguageCode.English;

const translationText = 'the translation of the term to English';

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: originalText,
        languageCode: originalLanguageCode,
    },
});

const termTranslated = termCreated.andThen<TermTranslated>({
    type: 'TERM_TRANSLATED',
    payload: {
        translation: translationText,
        languageCode: translationLanguageCode,
    },
});

const eventHistory = termTranslated.as(compositeId);

const [creationEvent, translationEvent] = eventHistory;

describe(`TermTranslatedEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

    let app: INestApplication;

    let termTranslatedEventHandler: TermTranslatedEventHandler;

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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );

        termTranslatedEventHandler = new TermTranslatedEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        arangoDatabaseForCollection.clear();

        const existingView = TermViewModel.fromTermCreated(creationEvent as TermCreated);

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing term`, () => {
        it(`should update the corresponding view with the translation`, async () => {
            // Act
            // @ts-expect-error fix this issue
            await termTranslatedEventHandler.handle(translationEvent);

            // Assert
            const updatedView = await testQueryRepository.fetchById(termId);

            if (isNotFound(updatedView)) {
                expect(updatedView).not.toBe(NotFound);

                // the compiler doesn't know the above will fail
                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedView.name); // hydrate an instance from a DTO

            const translationSearchResult = updatedName.getTranslation(translationLanguageCode);

            expect(translationSearchResult).not.toBe(NotFound);

            const translationItem = translationSearchResult as MultilingualTextItem;

            expect(translationItem.text).toBe(translationText);

            expect(translationItem.role).toBe(MultilingualTextItemRole.freeTranslation);

            // TODO check that the original text is still in tact as well
        });
    });

    describe(`when the term does not exist`, () => {
        it.todo(`should fail gracefully`);
    });
});
