import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
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
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { VocabularyListCreated } from '../create-vocabulary-list';
import { VocabularyListNameTranslated } from './vocabulary-list-name-translated.event';
import { VocabularyListNameTranslatedEventHandler } from './vocabulary-list-name-translated.event-handler';

const vocabularyListId = buildDummyUuid(345);

const originalLanguageCode = LanguageCode.Chilcotin;

const translationLanguageCode = LanguageCode.English;

const translationText = 'name in English';

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: 'VOCABULARY_LIST_CREATED',
    payload: {
        languageCodeForName: originalLanguageCode,
    },
});

const vocabularyListNameTranslated = vocabularyListCreated.andThen<VocabularyListNameTranslated>({
    type: 'VOCABULARY_LIST_NAME_TRANSLATED',
    payload: {
        text: translationText,
        languageCode: translationLanguageCode,
    },
});

const [creationEvent, translationEvent] = vocabularyListNameTranslated.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
}) as [VocabularyListCreated, VocabularyListNameTranslated];

const existingView = VocabularyListViewModel.fromVocabularyListCreated(creationEvent);

describe(`VocabularyListNameTranslatedEventHandler`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let vocabularyListNameTranslatedEventHandler: VocabularyListNameTranslatedEventHandler;

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

        testQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        vocabularyListNameTranslatedEventHandler = new VocabularyListNameTranslatedEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing vocabulary list`, () => {
        it(`should tranlsate the given vocabulary list`, async () => {
            await vocabularyListNameTranslatedEventHandler.handle(translationEvent);

            const searchResult = await testQueryRepository.fetchById(existingView.id);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as EventSourcedVocabularyListViewModel;

            const updatedName = new MultilingualText(updatedView.name);

            const nameTranslationSearchResult = updatedName.getTranslation(translationLanguageCode);

            expect(nameTranslationSearchResult).not.toBe(NotFound);

            const { text: foundText, languageCode: foundLanguageCode } =
                nameTranslationSearchResult as MultilingualTextItem;

            expect(foundText).toBe(translationText);

            expect(foundLanguageCode).toBe(translationLanguageCode);

            /**
             * We currently allow translation into multiple target languages.
             */
            expect(updatedView.actions).toContain('TRANSLATE_VOCABULARY_LIST_NAME');
        });
    });
});
