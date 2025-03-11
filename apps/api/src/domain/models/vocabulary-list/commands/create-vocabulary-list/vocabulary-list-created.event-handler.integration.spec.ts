import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
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
import { VocabularyListCreated } from './vocabulary-list-created.event';
import { VocabularyListCreatedEventHandler } from './vocabulary-list-created.event-handler';

const vocabularyListId = buildDummyUuid(111);

const vocabularyListName = 'test vocab list';

const originalLanguageCode = LanguageCode.Chilcotin;

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: 'VOCABULARY_LIST_CREATED',
    payload: {
        name: vocabularyListName,
        languageCodeForName: originalLanguageCode,
    },
});

const creationEvent = vocabularyListCreated.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
})[0] as VocabularyListCreated;

describe(`VocabularyListCreatedEventHandler`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

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

        testQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when there is a valid creation event`, () => {
        it(`should create the expected vocabulary list`, async () => {
            await new VocabularyListCreatedEventHandler(testQueryRepository).handle(creationEvent);

            const searchResult = await testQueryRepository.fetchById(vocabularyListId);

            expect(searchResult).not.toBe(NotFound);

            const view = searchResult as VocabularyListViewModel;

            const foundName = new MultilingualText(view.name);

            const { text: foundTextForName, languageCode: foundLanguageCodeForName } =
                foundName.getOriginalTextItem();

            expect(foundTextForName).toBe(vocabularyListName);

            expect(foundLanguageCodeForName).toBe(originalLanguageCode);

            expect(view.actions).toContain('PUBLISH_RESOURCE');
            expect(view.actions).toContain('CREATE_NOTE_ABOUT_RESOURCE');
            expect(view.actions).toContain('CONNECT_RESOURCES_WITH_NOTE');
            expect(view.actions).toContain('TRANSLATE_VOCABULARY_LIST_NAME');
            expect(view.actions).toContain('ADD_TERM_TO_VOCABULARY_LIST');
            expect(view.actions).toContain('REGISTER_VOCABULARY_LIST_FILTER_PROPERTY');
            /**
             * Note that we do not expose 'IMPORT_ENTRIES_TO_VOCABULARY_LIST'
             * in the  UX. We may want to update our approach to include
             * a `isAvailableInUx` flag in addition to the command type
             * on actions.
             */
        });
    });
});
