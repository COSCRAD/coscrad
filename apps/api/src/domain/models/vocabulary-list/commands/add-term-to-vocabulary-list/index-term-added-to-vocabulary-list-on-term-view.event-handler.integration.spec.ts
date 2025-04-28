import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { buildMultilingualTextFromBilingualText } from '../../../../common/build-multilingual-text-from-bilingual-text';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ITermQueryRepository } from '../../../term/queries';
import { ArangoTermQueryRepository } from '../../../term/repositories';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { IndexTermAddedToVocabularyListOnTermViewEventHandler } from './index-term-added-to-vocabulary-list-on-term-view.event-handler';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';

const vocabularyListId = buildDummyUuid(222);

const originalLanguageCode = LanguageCode.Chilcotin;

const vocabularyListName = 'vl name';

const translationLanguageCode = LanguageCode.English;

const vocabularyListNameInEnglish = 'vl name (english)';

const vocabularyListCompositeId = {
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
};

const termId = buildDummyUuid(1);

const existingTermView = buildTestInstance(TermViewModel);

const vocabularyListView = buildTestInstance(VocabularyListViewModel, {
    id: vocabularyListId,
    name: buildMultilingualTextFromBilingualText(
        { text: vocabularyListName, languageCode: originalLanguageCode },
        { text: vocabularyListNameInEnglish, languageCode: translationLanguageCode }
    ),
    entries: [],
});

const termAddedEvent = new TestEventStream().buildSingle<TermAddedToVocabularyList>({
    type: 'TERM_ADDED_TO_VOCABULARY_LIST',
    payload: {
        aggregateCompositeIdentifier: vocabularyListCompositeId,
        termId,
    },
});

describe(`IndexTermAddedToVocabularyListEventHandlerOnTermView.handle`, () => {
    let testVocabularyListQueryRepository: IVocabularyListQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: IndexTermAddedToVocabularyListOnTermViewEventHandler;

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

        testVocabularyListQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        const audioRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        termQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            audioRepository,
            new ConsoleCoscradCliLogger()
        );

        eventHandler = new IndexTermAddedToVocabularyListOnTermViewEventHandler(
            termQueryRepository,
            testVocabularyListQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await termQueryRepository.create(existingTermView);
    });

    describe(`when there is an existing vocabulary list`, () => {
        beforeEach(async () => {
            await testVocabularyListQueryRepository.create(vocabularyListView);
        });

        it(`should add the given term`, async () => {
            await eventHandler.handle(termAddedEvent);

            const updatedView = (await termQueryRepository.fetchById(
                existingTermView.id
            )) as TermViewModel;

            const { vocabularyLists } = updatedView;

            expect(vocabularyLists).not.toHaveLength(0);

            const foundList = vocabularyLists[0];

            expect(foundList.id).toBe(vocabularyListCompositeId.id);

            expect(foundList.name.toString()).toBe(
                new MultilingualText(vocabularyListView.name).toString()
            );
        });
    });

    describe(`when the vocabulary list does not exist`, () => {
        // no vocabulary list is created in a `beforeEach` here

        it(`should not write any data`, async () => {
            await eventHandler.handle(termAddedEvent);

            const updatedView = (await termQueryRepository.fetchById(
                existingTermView.id
            )) as TermViewModel;

            const { vocabularyLists } = updatedView;

            expect(vocabularyLists).toHaveLength(0);
        });
    });
});
