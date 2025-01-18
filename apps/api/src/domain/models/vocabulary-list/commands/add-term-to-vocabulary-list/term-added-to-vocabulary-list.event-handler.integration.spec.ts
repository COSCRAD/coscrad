import { AggregateType, IVocabularyListViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { TermCreated } from '../../../term/commands';
import { ITermQueryRepository } from '../../../term/queries';
import { ArangoTermQueryRepository } from '../../../term/repositories';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { VocabularyListCreated } from '../create-vocabulary-list';
import {
    FilterPropertyType,
    VocabularyListFilterPropertyRegistered,
} from '../register-vocabulary-list-filter-property';
import { TermAddedToVocabularyList } from './term-added-to-vocabulary-list.event';
import { TermAddedToVocabularyListEventHandler } from './term-added-to-vocabulary-list.event-handler';

const vocabularyListId = buildDummyUuid(222);

const originalLanguageCode = LanguageCode.Haida;

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: 'VOCABULARY_LIST_CREATED',
    payload: {
        languageCodeForName: originalLanguageCode,
    },
});

const filterPropertyName = 'person';

const filterPropertyType = FilterPropertyType.selection;

const allowedValuesAndLabels: { label: string; value: string }[] = [
    {
        label: 'I',
        value: '11',
    },
    {
        label: 'you',
        value: '21',
    },
    {
        label: 'they',
        value: '32',
    },
    {
        label: 'someone',
        value: '0',
    },
];

const vocabularyListNameTranslated =
    vocabularyListCreated.andThen<VocabularyListFilterPropertyRegistered>({
        type: 'VOCABULARY_LIST_PROPERTY_FILTER_REGISTERED',
        payload: {
            name: filterPropertyName,
            type: filterPropertyType,
            allowedValuesAndLabels,
        },
    });

const termId = buildDummyUuid(368);

const termText = 'I am running';

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: termText,
        languageCode: originalLanguageCode,
    },
});

const [termCreationEvent] = termCreated.as({
    type: AggregateType.term,
    id: termId,
}) as [TermCreated];

const existingTermView = TermViewModel.fromTermCreated(termCreationEvent);

const termAddedToVocabularyList = vocabularyListNameTranslated.andThen<TermAddedToVocabularyList>({
    type: 'TERM_ADDED_TO_VOCABULARY_LIST',
    payload: {
        termId,
    },
});

const [creationEvent, registrationEvent, termAddedEvent] = termAddedToVocabularyList.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
}) as [VocabularyListCreated, VocabularyListFilterPropertyRegistered, TermAddedToVocabularyList];

const existingView =
    VocabularyListViewModel.fromVocabularyListCreated(creationEvent).apply(registrationEvent);

describe(`TermAddedToVocabularyListEventHandler.handle`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: TermAddedToVocabularyListEventHandler;

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

        const audioRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        termQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            audioRepository,
            new ConsoleCoscradCliLogger()
        );

        eventHandler = new TermAddedToVocabularyListEventHandler(testQueryRepository);
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

        await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

        await termQueryRepository.create(existingTermView);
    });

    describe(`when there is an existing vocabulary list`, () => {
        it(`should add the given term`, async () => {
            await eventHandler.handle(termAddedEvent);

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as IVocabularyListViewModel;

            const entrySearchResult = updatedView.entries.find(
                ({ term }) => term.id === existingTermView.id
            );

            expect(entrySearchResult).toBeTruthy();
        });
    });
});
