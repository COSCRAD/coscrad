import {
    AggregateType,
    IValueAndDisplay,
    IVocabularyListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
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
import { EventSourcedVocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { VocabularyListCreated } from '../create-vocabulary-list';
import { FilterPropertyType } from './register-vocabulary-list-filter-property.command';
import { VocabularyListFilterPropertyRegistered } from './vocabulary-list-filter-property-registered';
import { VocabularyListFilterPropertyRegisteredEventHandler } from './vocabulary-list-filter-property-registered.event-handler';

const vocabularyListId = buildDummyUuid(345);

const originalLanguageCode = LanguageCode.Chilcotin;

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

const [creationEvent, registrationEvent] = vocabularyListNameTranslated.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
}) as [VocabularyListCreated, VocabularyListFilterPropertyRegistered];

const existingView = EventSourcedVocabularyListViewModel.fromVocabularyListCreated(creationEvent);

describe(`VocabularyListFilterPropertyRegistered.handle`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: VocabularyListFilterPropertyRegisteredEventHandler;

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

        testQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        eventHandler = new VocabularyListFilterPropertyRegisteredEventHandler(testQueryRepository);
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
        it(`should register the given filter property`, async () => {
            // act
            await eventHandler.handle(registrationEvent);

            // assert
            const updatedView = (await testQueryRepository.fetchById(
                existingView.id
            )) as IVocabularyListViewModel;

            const foundField = updatedView.form.fields.find(
                ({ name }) => name === filterPropertyName
            );

            expect(foundField).toBeTruthy();

            const { type: foundFormFieldType, options } = foundField;

            const foundOptions = options as IValueAndDisplay<string>[];

            expect(foundFormFieldType).toBe(filterPropertyType);

            expect(foundOptions).toHaveLength(allowedValuesAndLabels.length);

            const missingOptions = foundOptions.filter(
                (option: IValueAndDisplay<string>) =>
                    !allowedValuesAndLabels.some(
                        ({ value, label }) => value === option.value && label === option.display
                    )
            );

            expect(missingOptions).toHaveLength(0);
        });
    });
});