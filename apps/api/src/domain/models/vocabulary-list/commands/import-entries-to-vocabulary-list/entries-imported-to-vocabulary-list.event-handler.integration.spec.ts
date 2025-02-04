import { AggregateType, FormFieldType, LanguageCode } from '@coscrad/api-interfaces';
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
import { FilterPropertyType } from '../register-vocabulary-list-filter-property';
import { EntriesImportedToVocabularyList } from './entries-imported-to-vocabulary-list.event';
import { EntriesImportedToVocabularyListEventHandler } from './entries-imported-to-vocabulary-list.event-handler';

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

const entriesImported = vocabularyListCreated.andThen<EntriesImportedToVocabularyList>({
    type: 'ENTRIES_IMPORTED_TO_VOCABULARY_LIST',
    payload: {
        entries: [
            {
                termId: existingTermView.id,
                propertyValues: {
                    [filterPropertyName]: allowedValuesAndLabels[0].value,
                },
            },
        ],
    },
});

const [vocabularyListCreationEvent, importEvent] = entriesImported.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
}) as [VocabularyListCreated, EntriesImportedToVocabularyList];

const existingView = VocabularyListViewModel.fromVocabularyListCreated(vocabularyListCreationEvent);

// here we used state-based test setup for convenience
existingView.entries = [
    // in the domain, you can currently only import entries to an empty vocabulary list
];

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
            // TODO confirm that the query service ignores analysis for unregistered properties
            options: allowedValuesAndLabels.map(({ label, value }) => ({ value, display: label })),
        },
    ],
};

describe(`EntriesImportedToVocabularyListEventHandler`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: EntriesImportedToVocabularyListEventHandler;

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

        eventHandler = new EntriesImportedToVocabularyListEventHandler(testQueryRepository);
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

    describe(`when there are no entries in the existing vocabulary list`, () => {
        it(`should import the expected entries`, async () => {
            await eventHandler.handle(importEvent);

            const { entries } = (await testQueryRepository.fetchById(
                existingView.id
            )) as VocabularyListViewModel;

            expect(entries).toHaveLength(1);

            const searchResult = entries.find(({ term }) => (term.id = existingTermView.id));

            expect(searchResult).toBeTruthy();

            // why isn't this propertyValues?
            const { variableValues } = searchResult;

            // TODO add additional entries to the test import data
            expect([...Object.keys(variableValues)]).toHaveLength(1);

            expect(
                Object.entries(variableValues).some(
                    ([propertyName, propertyValue]) =>
                        propertyName === filterPropertyName &&
                        propertyValue === allowedValuesAndLabels[0].value
                )
            );
        });
    });
});
