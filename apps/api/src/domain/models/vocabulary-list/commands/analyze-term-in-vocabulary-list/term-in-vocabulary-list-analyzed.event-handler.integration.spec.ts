import { AggregateType, FormFieldType, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import {
    TermViewForVocabularyListEntry,
    VocabularyListEntryViewModel,
    VocabularyListViewModel,
} from '../../../../../queries/buildViewModelForResource/viewModels/vocabulary-list.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { VocabularyListCreated } from '../create-vocabulary-list';
import { FilterPropertyType } from '../register-vocabulary-list-filter-property';
import { TermInVocabularyListAnalyzed } from './term-in-vocabulary-list-analyzed.event';
import { TermInVocabularyListAnalyzedEventHandler } from './term-in-vocabulary-list-analyzed.event-handler';

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

const termId = buildDummyUuid(368);

const termText = 'I am running';

const existingTermView = buildTestInstance(TermViewForVocabularyListEntry, {
    id: termId,
    text: buildMultilingualTextWithSingleItem(termText, originalLanguageCode),
}); // TermViewModel.fromTermCreated(termCreationEvent);

const termAnalyzed = vocabularyListCreated.andThen<TermInVocabularyListAnalyzed>({
    type: 'TERM_IN_VOCABULARY_LIST_ANALYZED',
    payload: {
        termId,
        propertyValues: {
            [filterPropertyName]: allowedValuesAndLabels[0].value,
        },
    },
});

const [creationEvent, analysisEvent] = termAnalyzed.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
}) as [VocabularyListCreated, TermInVocabularyListAnalyzed];

// We use event-sourcing for the creation setup only
const existingView = VocabularyListViewModel.fromVocabularyListCreated(creationEvent);

existingView.actions.push('ANALYZE_TERM_IN_VOCABULARY_LIST');

// here we used state-based test setup for convenience
existingView.entries = [
    {
        term: existingTermView,
        // empty at the start
        variableValues: {},
    },
].map((dto) => new VocabularyListEntryViewModel(dto));

existingView.form = {
    fields: [
        {
            name: filterPropertyName,
            type:
                filterPropertyType === FilterPropertyType.selection
                    ? FormFieldType.staticSelect
                    : FormFieldType.switch,
            constraints: [],
            label: 'who',
            description: 'select the subject of the verb in the paradigm',
        },
    ],
};

describe(`TermInVocabularyListAnalyzedEventHandler.handle`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: TermInVocabularyListAnalyzedEventHandler;

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

        eventHandler = new TermInVocabularyListAnalyzedEventHandler(testQueryRepository);
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
        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing vocabulary list with the given term`, () => {
        it(`should add the filter information for the correspoding entry`, async () => {
            // act
            await eventHandler.handle(analysisEvent);

            // TODO add missing test coverage here

            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as VocabularyListViewModel;

            /**
             * This commmand can be run multiple times.
             */
            expect(updatedView.actions).toContain('ANALYZE_TERM_IN_VOCABULARY_LIST');
        });
    });
});
